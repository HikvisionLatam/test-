import base64
import json
import os
import re
import time
from datetime import datetime, timedelta

import requests
from Crypto.Cipher import PKCS1_v1_5
from Crypto.PublicKey import RSA
from dotenv import load_dotenv
from exchangelib import DELEGATE, Account, Configuration, Credentials
from exchangelib.errors import TransportError, UnauthorizedError

# Carga las variables de entorno desde el archivo .env
load_dotenv()

# ==============================================================================
# SECCIÓN DE CONFIGURACIÓN
# ==============================================================================
HIK_ACCOUNT = os.getenv('HIK_USERNAME')
HIK_PASSWORD = os.getenv('HIK_PASSWORD')
EMAIL_USER = os.getenv('MY_EMAIL_USER')
EMAIL_PASS = os.getenv('MY_EMAIL_PASS')
IMAP_SERVER = os.getenv('MY_IMAP_SERVER')

# ==============================================================================
# MÓDULO DE AUTENTICACIÓN
# ==============================================================================

def encrypt_password_rsa(plain_password):
    """
    Encripta la contraseña usando RSA.
    Esta versión decodifica la clave Base64 directamente para evitar errores de formato.
    """
    print("Encriptando contraseña con RSA...")
    
    # Esta es la clave pública en formato Base64 puro, tal como está en el JavaScript.
    b64_public_key = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpxVL912IA7/CT46fu7//7Uup/x4c3E2Vv8A8cYcgq5d250lRBYxqjFyc8mwdWPIivIdcCWf96Nw6qyteb4/GLbSY6OIJly0bdNL+3b38/te8dbqjStvmpQYtzelDLvGeJyowg500mEHC7L7yVFinRn2vjmg1VO6ET88hZoAS/pQIDAQAB"
    
    try:
        # Decodificamos la clave de Base64 a formato binario (DER)
        key_der = base64.b64decode(b64_public_key)
        
        # Importamos la clave binaria
        key = RSA.import_key(key_der)
        
        cipher = PKCS1_v1_5.new(key)
        encrypted_password_bytes = cipher.encrypt(plain_password.encode('utf-8'))
        encrypted_password_b64 = base64.b64encode(encrypted_password_bytes)
        
        return encrypted_password_b64.decode('utf-8')
    except Exception as e:
        print(f"ERROR: Fallo durante la encriptación RSA: {e}")
        return None

# Mantenemos tu función de correo que ya funcionaba
def get_verification_code(email_user, email_pass, imap_server):
    """
    Busca el último código de verificación en la bandeja de entrada usando exchangelib.
    """
    try:
        creds = Credentials(email_user, email_pass)
        config = Configuration(server=imap_server, credentials=creds)
        account = Account(
            primary_smtp_address=email_user,
            credentials=creds,
            config=config,
            autodiscover=False,
            access_type=DELEGATE
        )
        for item in account.inbox.filter(subject__icontains='Verification code for admin login').order_by('-datetime_received')[:5]:
            body = item.body
            match = re.search(r'Your verification code is (\d{6})', str(body))
            if match:
                code = match.group(1)
                print(f"✅ Código de verificación encontrado: {code}")
                return code
        print("No se encontró ningún correo con el código de verificación.")
        return None
    except Exception as e:
        print(f"[ERROR] Error inesperado al leer el correo: {type(e).__name__}: {e}")
        return None

def login_and_get_session():
    """
    Orquesta el proceso completo de login automático y devuelve una sesión autenticada.
    """
    # (El resto de la función es idéntica a tu versión que funcionaba)
    if not all([HIK_ACCOUNT, HIK_PASSWORD, EMAIL_USER, EMAIL_PASS, IMAP_SERVER]):
        print("ERROR: Faltan variables de entorno. Revisa tu archivo .env.")
        return None

    REQUEST_CODE_URL = 'https://elearning-admin.hikvision.com/manage/sendEmailVerifyCode'
    FINAL_LOGIN_URL = 'https://elearning-admin.hikvision.com/manage/login'
    session = requests.Session()
    session.verify = False

    print("Paso 1: Solicitando código de verificación...")
    try:
        session.post(REQUEST_CODE_URL, json={'siteId': 1, 'account': HIK_ACCOUNT})
        print("-> Solicitud enviada. Esperando 30 segundos para que llegue el correo...")
        time.sleep(30)
    except requests.RequestException as e:
        print(f"Error de red al solicitar el código: {e}")
        return None

    print("\nPaso 2: Leyendo el código de la bandeja de entrada...")
    verification_code = get_verification_code(EMAIL_USER, EMAIL_PASS, IMAP_SERVER)
    if not verification_code:
        return None

    print("\nPaso 3: Encriptando la contraseña con RSA...")
    encrypted_pass = encrypt_password_rsa(HIK_PASSWORD)
    if not encrypted_pass:
        return None
    print("-> Contraseña encriptada lista.")

    print("\nPaso 4: Realizando el inicio de sesión final...")
    final_payload = {
        "siteId": 1, "account": HIK_ACCOUNT, "password": encrypted_pass, "verifyCode": verification_code
    }
    try:
        response_login = session.post(FINAL_LOGIN_URL, json=final_payload)
        response_login.raise_for_status()
        login_data = response_login.json()
        access_token = login_data.get('data', {}).get('access_token')
        
        if not access_token:
            print(f"Login final fallido, token no encontrado. Respuesta: {login_data}")
            return None
        
        print("✅ ¡Login y obtención de token exitosos!")
        session.headers.update({
            'Authorization': f'Bearer {access_token}', 'siteId': '14',
            'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json'
        })
        return session
    except requests.HTTPError as e:
        print(f"Error HTTP en el login final: {e.response.status_code} - {e.response.text}")
        return None
    except requests.RequestException as e:
        print(f"Error de red en el login final: {e}")
        return None

# ==============================================================================
# MÓDULO DE EXTRACCIÓN DE DATOS Y EJECUCIÓN PRINCIPAL (Sin cambios)
# ==============================================================================
# (El resto del código es exactamente el mismo que ya tenías)

def format_timestamp(ts):
    if not ts: return None
    try:
        return datetime.fromtimestamp(ts / 1000).strftime('%Y-%m-%d %H:%M:%S')
    except (ValueError, TypeError):
        return None

def fetch_data(session, endpoint_url, type_event):
    today = datetime.now()
    start_of_month_dt = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end_of_month_dt = (start_of_month_dt.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(seconds=1)
    
    payload_base = {
        "siteId": 14, "states": ["0", "1", "2", "3"], 
        "beginTime": int(start_of_month_dt.timestamp() * 1000), 
        "endTime": int(end_of_month_dt.timestamp() * 1000),     
        "pageSize": 100, "pageNum": 1, "publicStatusList": ["0"]
    }
    all_raw_records = []
    current_page = 1
    while True:
        payload_base["pageNum"] = current_page
        response = session.post(endpoint_url, json=payload_base)
        response.raise_for_status()
        data = response.json()
        records_on_page = data.get("data", {}).get("rows", [])
        if not records_on_page:
            break
        all_raw_records.extend(records_on_page)
        current_page += 1
    state_map = {0: "Unreleased", 1: "Released", 2: "Finished", 3: "Discarded"}
    cleaned_data = []
    for record in all_raw_records:
        lecturer_name = record.get("lecturers")[0].get("name", "") if record.get("lecturers") else ""
        state_text = state_map.get(record.get("state"), str(record.get("state")))
        cleaned_data.append({
            "id": record.get("id"), "state": state_text, "classroomName": record.get("classroomName"),
            "registeredNumber": record.get("registeredNumber"), "remainCapacity": record.get("remainCapacity"),
            "description": record.get("description"), "languageComplete": record.get("languageComplete"),
            "startTime": format_timestamp(record.get("startTime")), "overTime": format_timestamp(record.get("overTime")),
            "location": record.get("location"), "name": record.get("name"), "lecturer_name": lecturer_name,
            "typeEvent": type_event
        })
    return cleaned_data

def main():
    print("--- INICIANDO PROCESO DE EXTRACCIÓN AUTOMÁTICA ---")
    session = login_and_get_session()
    
    if not session:
        print("\nFallo en la autenticación inicial. El script no puede continuar.")
        return

    endpoints = {
        "Webinar & Seminarios": 'https://elearning-admin.hikvision.com/manage/nonCertifiedClassroom/getList',
        "Certificaciones": 'https://elearning-admin.hikvision.com/manage/classroom/getList'
    }
    
    all_data = []
    for event_type, url in endpoints.items():
        for attempt in range(2):
            try:
                print(f"\nObteniendo datos de '{event_type}' (Intento {attempt + 1})...")
                data = fetch_data(session, url, event_type)
                all_data.extend(data)
                print(f"-> Se obtuvieron {len(data)} registros.")
                break
            except requests.exceptions.HTTPError as e:
                if e.response.status_code == 401 and attempt == 0:
                    print("ATENCIÓN: Token expirado (Error 401). Se intentará re-autenticar...")
                    session = login_and_get_session()
                    if not session:
                        print("Fallo en la re-autenticación. Abortando para este endpoint.")
                        break
                else:
                    print(f"Error HTTP no recuperable ({e.response.status_code}) para '{event_type}': {e.response.text}")
                    break
            except requests.RequestException as e:
                print(f"Error de red al obtener datos para '{event_type}': {e}")
                break
    
    if not all_data:
        print("\nNo se obtuvieron datos en esta ejecución.")
        return

    print("\nOrganizando datos por país...")
    grouped_by_country = {}
    for record in all_data:
        key = record.get("name", "desconocido").strip().replace(" ", "_").lower()
        grouped_by_country.setdefault(key, []).append(record)

    output_dir = "output_json"
    os.makedirs(output_dir, exist_ok=True)
    for country_key, records in grouped_by_country.items():
        filepath = os.path.join(output_dir, f"{country_key}.json")
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=4)
        print(f" -> Guardado archivo: {filepath} con {len(records)} registros.")

    print("\n--- PROCESO FINAL COMPLETADO ---")

if __name__ == "__main__":
    main()