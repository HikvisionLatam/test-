import requests
import json
from datetime import datetime, timedelta
import urllib3
import os

# Opcional: Oculta las advertencias de SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ==============================================================================
# PEGA AQUÍ TUS DICCIONARIOS 'cookies' Y 'headers' MÁS RECIENTES
# ==============================================================================
cookies = {
    '_pctx': '%7Bu%7DN4IgrgzgpgThIC4B2YA2qA05owMoBcBDfSREQpAeyRCwgEt8oBJAE0RXSwH18yBbAG5CARgE8AjgFYAPvwBmYgOZQAFlCkgAvkA',
    'atidvisitor': '%7B%22name%22%3A%22atidvisitor%22%2C%22val%22%3A%7B%22vrn%22%3A%22-631698-%22%7D%2C%22options%22%3A%7B%22path%22%3A%22%2F%22%2C%22session%22%3A15724800%2C%22end%22%3A15724800%7D%7D',
    'atuserid': '%7B%22name%22%3A%22atuserid%22%2C%22val%22%3A%22d719e323-7af4-4f32-b518-c311b01ffa26%22%2C%22options%22%3A%7B%22end%22%3A%222026-10-26T21%3A07%3A47.144Z%22%2C%22path%22%3A%22%2F%22%7D%7D',
    '_gcl_au': '1.1.1440651047.1758749473',
    'hubspotutk': '9166d4a74564c60352b950c31005620b',
    '_fbp': 'fb.1.1758749478830.356087694670698033',
    '_pcid': '%7B%22browserId%22%3A%22d719e323-7af4-4f32-b518-c311b01ffa26%22%2C%22_t%22%3A%22mvmvbyq4%7Cmfygehe4%22%7D',
    '_ga_VLV9WH5RE1': 'GS2.1.s1758811277$o1$g1$t1758811517$j60$l0$h0',
    '_ga_PN3K4JY017': 'GS2.2.s1758815721$o2$g0$t1758815721$j60$l0$h0',
    '_ga': 'GA1.1.924416901.1758746746',
    '_hjSessionUser_3159860': 'eyJpZCI6IjJmODIxNzgzLTFjMzktNWEzYi1iYTFjLTgzOTRkZDQwOWYzOCIsImNyZWF0ZWQiOjE3NTg4MTYyMDAwNzksImV4aXN0aW5nIjp0cnVlfQ==',
    '_ga_3MVPEJYQ21': 'GS2.1.s1758839512$o1$g1$t1758839526$j46$l0$h0',
    '_ga_XRYFVE08QM': 'GS2.1.s1758839500$o1$g1$t1758839605$j60$l0$h0',
    'ip_expired': 'Colombia',
    '_ga_NJR5L1HL64': 'GS2.1.s1758837888$o5$g1$t1758841906$j59$l0$h0',
    '_ga_PG3HDW12RB': 'GS2.1.s1758893986$o3$g0$t1758893991$j55$l0$h1174065016',
    '_ga_NV9960V27T': 'GS2.1.s1758893986$o3$g0$t1758893991$j55$l0$h0',
    '_clck': '1totifu%5E2%5Efzn%5E0%5E2095',
    '_clsk': '19pfyoj%5E1758900433016%5E1%5E1%5Ej.clarity.ms%2Fcollect',
    '__hstc': '140241068.9166d4a74564c60352b950c31005620b.1758749478025.1758815721269.1758900433906.3',
    '__hssrc': '1',
    '_ga_43ZPF0YW1Y': 'GS2.1.s1758900432$o1$g0$t1758900448$j44$l0$h0',
}

headers = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'es-ES,es;q=0.9',
    'Authorization': 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2tleSI6IjhjODdjMmM4LWRlZDUtNDQ2Zi1iNDczLWNhZTRhMTlhZjRmZSJ9.J3282E8-lu1wc1AnzlZ2U9hR-lDQu0VbHP5Lj-D64ERJ1RSum7rQSyDHSSI24iO_Z28RiOruNU4IzpZ_LwE9mg',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Origin': 'https://elearning-admin.hikvision.com',
    'Pragma': 'no-cache',
    'Referer': 'https://elearning-admin.hikvision.com/classroom',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
    'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'siteId': '14',
    # 'Cookie': '_pctx=%7Bu%7DN4IgrgzgpgThIC4B2YA2qA05owMoBcBDfSREQpAeyRCwgEt8oBJAE0RXSwH18yBbAG5CARgE8AjgFYAPvwBmYgOZQAFlCkgAvkA; atidvisitor=%7B%22name%22%3A%22atidvisitor%22%2C%22val%22%3A%7B%22vrn%22%3A%22-631698-%22%7D%2C%22options%22%3A%7B%22path%22%3A%22%2F%22%2C%22session%22%3A15724800%2C%22end%22%3A15724800%7D%7D; atuserid=%7B%22name%22%3A%22atuserid%22%2C%22val%22%3A%22d719e323-7af4-4f32-b518-c311b01ffa26%22%2C%22options%22%3A%7B%22end%22%3A%222026-10-26T21%3A07%3A47.144Z%22%2C%22path%22%3A%22%2F%22%7D%7D; _gcl_au=1.1.1440651047.1758749473; hubspotutk=9166d4a74564c60352b950c31005620b; _fbp=fb.1.1758749478830.356087694670698033; _pcid=%7B%22browserId%22%3A%22d719e323-7af4-4f32-b518-c311b01ffa26%22%2C%22_t%22%3A%22mvmvbyq4%7Cmfygehe4%22%7D; _ga_VLV9WH5RE1=GS2.1.s1758811277$o1$g1$t1758811517$j60$l0$h0; _ga_PN3K4JY017=GS2.2.s1758815721$o2$g0$t1758815721$j60$l0$h0; _ga=GA1.1.924416901.1758746746; _hjSessionUser_3159860=eyJpZCI6IjJmODIxNzgzLTFjMzktNWEzYi1iYTFjLTgzOTRkZDQwOWYzOCIsImNyZWF0ZWQiOjE3NTg4MTYyMDAwNzksImV4aXN0aW5nIjp0cnVlfQ==; _ga_3MVPEJYQ21=GS2.1.s1758839512$o1$g1$t1758839526$j46$l0$h0; _ga_XRYFVE08QM=GS2.1.s1758839500$o1$g1$t1758839605$j60$l0$h0; ip_expired=Colombia; _ga_NJR5L1HL64=GS2.1.s1758837888$o5$g1$t1758841906$j59$l0$h0; _ga_PG3HDW12RB=GS2.1.s1758893986$o3$g0$t1758893991$j55$l0$h1174065016; _ga_NV9960V27T=GS2.1.s1758893986$o3$g0$t1758893991$j55$l0$h0; _clck=1totifu%5E2%5Efzn%5E0%5E2095; _clsk=19pfyoj%5E1758900433016%5E1%5E1%5Ej.clarity.ms%2Fcollect; __hstc=140241068.9166d4a74564c60352b950c31005620b.1758749478025.1758815721269.1758900433906.3; __hssrc=1; _ga_43ZPF0YW1Y=GS2.1.s1758900432$o1$g0$t1758900448$j44$l0$h0',
}

# ==============================================================================

def format_timestamp(ts):
    """Convierte el timestamp de milisegundos a una fecha legible."""
    if not ts: return None
    try:
        return datetime.fromtimestamp(ts / 1000).strftime('%Y-%m-%d %H:%M:%S')
    except (ValueError, TypeError):
        return None

def fetch_data(endpoint_url, type_event):
    """
    Obtiene y limpia los datos desde el endpoint especificado, agregando el campo typeEvent.
    """
    today = datetime.now()
    start_of_month_dt = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month_dt = (start_of_month_dt.replace(day=28) + timedelta(days=4)).replace(day=1)
    end_of_month_dt = next_month_dt - timedelta(microseconds=1)
    begin_time_ts = int(start_of_month_dt.timestamp() * 1000)
    end_time_ts = int(end_of_month_dt.timestamp() * 1000)

    payload_base = {
        "siteId": 14,
        "states": ["0", "1", "2", "3"], 
        "beginTime": begin_time_ts, 
        "endTime": end_time_ts,     
        "pageSize": 100,
        "pageNum": 1,
        "publicStatusList": ["0"]
    }

    all_raw_records = []
    current_page = 1
    while True:
        payload_base["pageNum"] = current_page
        try:
            response = requests.post(
                endpoint_url,
                cookies=cookies, headers=headers, json=payload_base, verify=False
            )
            response.raise_for_status()
            data = response.json()
            records_on_page = data.get("data", {}).get("rows", [])
            if not records_on_page:
                break
            all_raw_records.extend(records_on_page)
            current_page += 1
        except Exception as e:
            print(f"Ocurrió un error en {endpoint_url}: {e}")
            break

    state_map = {
        0: "Unreleased",
        1: "Released",
        2: "Finished",
        3: "Discarded"
    }
    cleaned_data = []
    for record in all_raw_records:
        lecturer_name = ""
        if record.get("lecturers") and len(record["lecturers"]) > 0:
            lecturer_name = record["lecturers"][0].get("name", "")

        state_value = record.get("state")
        try:
            state_int = int(state_value)
        except (ValueError, TypeError):
            state_int = state_value
        state_text = state_map.get(state_int, str(state_value))

        cleaned_data.append({
            "id": record.get("id"),
            "state": state_text,
            "classroomName": record.get("classroomName"),
            "registeredNumber": record.get("registeredNumber"),
            "remainCapacity": record.get("remainCapacity"),
            "description": record.get("description"),
            "languageComplete": record.get("languageComplete"),
            "startTime": format_timestamp(record.get("startTime")),
            "overTime": format_timestamp(record.get("overTime")),
            "location": record.get("location"),
            "name": record.get("name"),
            "lecturer_name": lecturer_name,
            "typeEvent": type_event
        })
    return cleaned_data

def fetch_and_organize_data():
    print("Obteniendo datos de Webinar & Seminarios...")
    webinars = fetch_data(
        'https://elearning-admin.hikvision.com/manage/nonCertifiedClassroom/getList',
        "Webinar & Seminarios"
    )
    print("Obteniendo datos de Certificaciones...")
    certificaciones = fetch_data(
        'https://elearning-admin.hikvision.com/manage/classroom/getList',
        "Certificaciones"
    )

    # --- Agrupar por país ---
    all_records = webinars + certificaciones
    grouped_by_country = {}
    for record in all_records:
        country = record.get("name", "desconocido")
        key = country.strip().replace(" ", "_").lower()
        if key not in grouped_by_country:
            grouped_by_country[key] = []
        grouped_by_country[key].append(record)

    output_dir = "output_json"
    os.makedirs(output_dir, exist_ok=True)

    # --- Guardar cada país en su propio archivo ---
    for country_key, records in grouped_by_country.items():
        filename = f"{country_key}.json"
        filepath = os.path.join(output_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(records, f, ensure_ascii=False, indent=4)
        print(f" -> Creado archivo: {filepath} con {len(records)} registros.")

    print("\n¡Proceso final completado!")


if __name__ == "__main__":
    fetch_and_organize_data()