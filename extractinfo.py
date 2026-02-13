import base64
import os
import re
import time
from datetime import datetime, timedelta, timezone as dt_timezone

import requests
from Crypto.Cipher import PKCS1_v1_5
from Crypto.PublicKey import RSA
from dotenv import load_dotenv
from exchangelib import DELEGATE, Account, Configuration, Credentials

try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

# --- CARGA DE VARIABLES DE ENTORNO ---
load_dotenv()

HIK_ACCOUNT = os.getenv("HIK_USERNAME")
HIK_PASSWORD = os.getenv("HIK_PASSWORD")
EMAIL_USER = os.getenv("MY_EMAIL_USER")
EMAIL_PASS = os.getenv("MY_EMAIL_PASS")
IMAP_SERVER = os.getenv("MY_IMAP_SERVER")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# --- CONFIGURACIÓN DE SITIOS ---
SITES_CONFIG = [
    {"id": 14, "strict_filter": True, "name": "LATAM (Site 14)"},
    {"id": 11, "strict_filter": False, "name": "Brasil (Site 11)"} 
]

# ---------------- MÓDULO DE SEGURIDAD Y LOGIN ----------------

def encrypt_password_rsa(plain_password: str) -> str | None:
    b64_public_key = (
        "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCpxVL912IA7/CT46fu7//7Uup/"
        "x4c3E2Vv8A8cYcgq5d250lRBYxqjFyc8mwdWPIivIdcCWf96Nw6qyteb4/GLbSY6O"
        "IJly0bdNL+3b38/te8dbqjStvmpQYtzelDLvGeJyowg500mEHC7L7yVFinRn2vjmg"
        "1VO6ET88hZoAS/pQIDAQAB"
    )
    try:
        key_der = base64.b64decode(b64_public_key)
        key = RSA.import_key(key_der)
        cipher = PKCS1_v1_5.new(key)
        encrypted_bytes = cipher.encrypt(plain_password.encode("utf-8"))
        return base64.b64encode(encrypted_bytes).decode("utf-8")
    except Exception as e:
        print(f"[RSA] Error crítico en encriptación: {e}")
        return None


def get_verification_code(email_user: str, email_pass: str, imap_server: str) -> str | None:
    try:
        creds = Credentials(email_user, email_pass)
        config = Configuration(server=imap_server, credentials=creds)
        account = Account(
            primary_smtp_address=email_user,
            credentials=creds,
            config=config,
            autodiscover=False,
            access_type=DELEGATE,
        )

        FOLDER_NAME = "eLearning" 

        try:
            target_folder = account.inbox / FOLDER_NAME
        except Exception:
            target_folder = account.root / 'Top of Information Store' / FOLDER_NAME

        queryset = target_folder.filter(
            subject__icontains="Verification code for admin login"
        ).order_by("-datetime_received")[:5]

        for item in queryset:
            match = re.search(r"Your verification code is (\d{6})", str(item.body))
            if match:
                return match.group(1)
        return None
    except Exception as e:
        print(f"[IMAP] Fallo en la conexión al correo: {e}")
        return None

def login_and_get_session() -> requests.Session | None:
    if not all([HIK_ACCOUNT, HIK_PASSWORD, EMAIL_USER, EMAIL_PASS, IMAP_SERVER]):
        print("[CONFIG] Faltan variables de entorno críticas.")
        return None

    REQUEST_CODE_URL = "https://elearning-admin.hikvision.com/manage/sendEmailVerifyCode"
    LOGIN_URL = "https://elearning-admin.hikvision.com/manage/login"
    session = requests.Session()
    session.verify = False 

    print("--- LOGIN: Paso 1 (Solicitud de código) ---")
    try:
        session.post(REQUEST_CODE_URL, json={"siteId": 1, "account": HIK_ACCOUNT})
        print("Esperando 30s para recepción del correo...")
        time.sleep(30)
    except Exception as e:
        print(f"[LOGIN] Error solicitando código: {e}")
        return None

    print("--- LOGIN: Paso 2 (Lectura IMAP) ---")
    code = get_verification_code(EMAIL_USER, EMAIL_PASS, IMAP_SERVER)
    if not code:
        print("[LOGIN] No se pudo obtener el código del correo.")
        return None

    print("--- LOGIN: Paso 3 (Encriptación RSA) ---")
    encrypted_pass = encrypt_password_rsa(HIK_PASSWORD)
    if not encrypted_pass:
        return None

    print("--- LOGIN: Paso 4 (Autenticación) ---")
    try:
        payload = {"siteId": 1, "account": HIK_ACCOUNT, "password": encrypted_pass, "verifyCode": code}
        r = session.post(LOGIN_URL, json=payload)
        r.raise_for_status()
        token = r.json().get("data", {}).get("access_token")

        if not token:
            print("[LOGIN] Fallo: No se recibió token.")
            return None

        session.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
        print("[LOGIN] Autenticación exitosa.")
        return session
    except Exception as e:
        print(f"[LOGIN] Error fatal en login: {e}")
        return None


# ---------------- EXTRACCIÓN Y LÓGICA DE NEGOCIO ----------------

def parse_timezone(tz_str: str | None):
    if not tz_str:
        return None
    tz_raw = str(tz_str).strip()
    tz_raw = re.sub(r'(?i)^(?:UTC|GMT)\s*', '', tz_raw)
    m = re.match(r'^([+-]?\d+)$', tz_raw)
    if m:
        hours = int(m.group(1))
        return dt_timezone(timedelta(hours=hours))
    m = re.match(r'^([+-])(\d{1,2})(?::?(\d{2}))?$', tz_raw)
    if m:
        sign = 1 if m.group(1) == '+' else -1
        hh = int(m.group(2))
        mm = int(m.group(3)) if m.group(3) else 0
        return dt_timezone(sign * timedelta(hours=hh, minutes=mm))
    if ZoneInfo:
        try: return ZoneInfo(tz_raw)
        except Exception: pass
    return None


def format_timestamp(ts: int | None, tz_str: str | None = None) -> str | None:
    if not ts: return None
    try:
        tzinfo = parse_timezone(tz_str)
        dt_utc = datetime.fromtimestamp(ts / 1000, tz=dt_timezone.utc)
        dt_local = dt_utc.astimezone(tzinfo) if tzinfo else dt_utc
        return dt_local.strftime("%Y-%m-%d %H:%M:%S")
    except Exception: return None


def fetch_data(session: requests.Session, endpoint_url: str, type_event: str, site_id: int, strict_filter: bool) -> list[dict]:
    today = datetime.now()
    start = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = start + timedelta(days=730)

    payload = {
        "siteId": site_id,
        "states": ["0", "1", "2", "3"],
        "beginTime": int(start.timestamp() * 1000),
        "endTime": int(end.timestamp() * 1000),
        "pageSize": 100,
        "pageNum": 1,
        "publicStatusList": ["0", "1"],
    }

    all_raw = []
    page = 1
    while True:
        payload["pageNum"] = page
        try:
            r = session.post(endpoint_url, json=payload)
            r.raise_for_status()
            rows = r.json().get("data", {}).get("rows", [])
        except Exception as e:
            print(f"[FETCH] Error en Site {site_id}: {e}")
            break
        if not rows: break
        all_raw.extend(rows)
        page += 1

    state_map = {0: "Unreleased", 1: "Released", 2: "Finished", 3: "Discarded", 8: "Cancelled"}
    cleaned = []

    for rec in all_raw:
        if rec.get("state") == 8:
            continue

        raw_name = rec.get("classroomName") or ""
        p_status = rec.get("publicStatus")
        site_name_from_rec = rec.get("name")
        cert_index = raw_name.lower().find("_cert_")
        match = raw_name[cert_index + 6:] if cert_index != -1 else None
        
        try: p_status_int = int(p_status) if p_status is not None else -1
        except (ValueError, TypeError): p_status_int = -1

        final_name = raw_name
        if strict_filter:
            if p_status_int == 1:
                if not match: continue 
                final_name = match
            else:
                if match: final_name = match
        else:
            if match: final_name = match

        lecturers = rec.get("lecturers") or []
        lecturer_name = lecturers[0].get("name") if lecturers else ""
        teaching_mode = "Virtual" if str(rec.get("teachingType")) == "2" else "Presencial"
        final_type_event = "Destacados" if site_name_from_rec and "LATAM" in site_name_from_rec.upper() else type_event

        cleaned.append({
            "id": rec.get("id"),
            "state": state_map.get(rec.get("state"), str(rec.get("state"))),
            "classroomName": final_name,
            "registeredNumber": rec.get("registeredNumber"),
            "remainCapacity": rec.get("maxCapacity"),
            "description": rec.get("description"),
            "languageComplete": rec.get("languageComplete"),
            "startTime": format_timestamp(rec.get("startTime"), rec.get("timezone")),
            "overTime": format_timestamp(rec.get("overTime"), rec.get("timezone")),
            "location": rec.get("location"),
            "name": rec.get("name"),
            "lecturer_name": lecturer_name,
            "typeEvent": final_type_event, 
            "modalidad": teaching_mode,
            "city": rec.get("city"),
        })
    return cleaned

# ---------------- PERSISTENCIA Y SINCRONIZACIÓN (SUPABASE) ----------------

def sync_supabase(all_data: list[dict], site_name_filter: str) -> None:
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("[SUPABASE] Credenciales no configuradas.")
        return

    headers = {
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
        "Content-Type": "application/json",
    }
    
    # 1. UPSERT: Insertar o actualizar
    url = f"{SUPABASE_URL}/rest/v1/events"
    payload = [r for r in all_data if r.get("id") is not None]
    
    if payload:
        print(f"[SUPABASE] Sincronizando {len(payload)} registros...")
        try:
            upsert_headers = {**headers, "Prefer": "return=minimal,resolution=merge-duplicates"}
            requests.post(url, params={"on_conflict": "id"}, json=payload, headers=upsert_headers, timeout=60)
        except Exception as e:
            print(f"[SUPABASE] Error en Upsert: {e}")

    current_ids = [str(r["id"]) for r in payload]
    
    if current_ids:
        clean_params = {
            "id": f"not.in.({','.join(current_ids)})",
            "name": f"ilike.*{site_name_filter}*" 
        }
        try:
            resp = requests.delete(url, headers=headers, params=clean_params)
            if resp.status_code in (200, 204):
                print(f"[SUPABASE] Limpieza completada para {site_name_filter}.")
        except Exception as e:
            print(f"[SUPABASE] Error en limpieza: {e}")


# ---------------- FLUJO PRINCIPAL ----------------

def main() -> None:
    print("--- INICIANDO EXTRACTOR HIKVISION CON AUTO-LIMPIEZA ---")
    session = login_and_get_session()
    if not session: return

    endpoints = {
        "Webinar & Seminarios": "https://elearning-admin.hikvision.com/manage/nonCertifiedClassroom/getList",
        "Certificaciones": "https://elearning-admin.hikvision.com/manage/classroom/getList",
    }

    for site_conf in SITES_CONFIG:
        site_id = site_conf["id"]
        strict = site_conf["strict_filter"]
        site_name = site_conf["name"]
        
        print(f"\n>> Procesando: {site_name} (ID: {site_id})")
        session.headers.update({"siteId": str(site_id)})

        site_records = []
        for event_type, url in endpoints.items():
            try:
                data = fetch_data(session, url, event_type, site_id, strict)
                site_records.extend(data)
            except Exception as e:
                print(f"   Error en {event_type}: {e}")

        # Sincronizamos por sitio para poder limpiar correctamente
        # Usamos parte del nombre (Brasil o LATAM) para el filtro de borrado
        filter_keyword = "Brasil" if "Brasil" in site_name else "LATAM"
        sync_supabase(site_records, filter_keyword)

    print("\n--- PROCESO FINALIZADO CON ÉXITO ---")


if __name__ == "__main__":
    start_ts = time.time()
    print(f"[{datetime.now():%Y-%m-%d %H:%M:%S}] Script iniciado")
    try:
        main()
    finally:
        print(f"Tiempo total: {time.time() - start_ts:.2f} s")