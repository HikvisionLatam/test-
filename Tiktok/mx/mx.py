# cookies.json <---- required for session management

import asyncio
import os
import json
import logging
import random
import tempfile
from datetime import datetime
from dotenv import load_dotenv
import boto3
from botocore.config import Config
from playwright.async_api import async_playwright
import yt_dlp
from io import BytesIO
from PIL import Image
import requests
from botocore.exceptions import ClientError

# ─── CARGAR CONFIGURACIÓN ──────────────────────────────────────────────────────
load_dotenv()
ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID')
ACCESS_KEY = os.getenv('CF_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('CF_SECRET_ACCESS_KEY')
BUCKET     = os.getenv('CF_R2_BUCKET_MX') # Asegúrate que esta variable es la correcta para MX
ENDPOINT   = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"
PUBLIC_R2  = "https://pub-8c40dfc8b11e469481e204a4eca1c41e.r2.dev"

# Validar variables de entorno críticas
if not all([ACCOUNT_ID, ACCESS_KEY, SECRET_KEY, BUCKET]):
    raise ValueError(
        f"Faltan variables de entorno requeridas: "
        f"CF_ACCOUNT_ID={ACCOUNT_ID}, CF_ACCESS_KEY_ID={ACCESS_KEY}, CF_SECRET_ACCESS_KEY={'***' if SECRET_KEY else None}, CF_R2_BUCKET_MX={BUCKET}"
    )

# Cliente S3 para Cloudflare R2
s3 = boto3.client(
    's3',
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name='auto',
    config=Config(s3={'addressing_style': 'path'})
)

# ─── CONSTANTES ───────────────────────────────────────────────────────────────
VIDEOS_A_PROCESAR = [
    "https://www.tiktok.com/@hikvisionmx/video/7527738701070273798?lang=es",
    "https://www.tiktok.com/@hikvisionmx/video/7514910099232525574?lang=es",
    "https://www.tiktok.com/@hikvisionmx/video/7519200229283974456?lang=es",
    "https://www.tiktok.com/@hikvisionmx/video/7455822053405478150?lang=es",
    "https://www.tiktok.com/@hikvisionmx/video/7444346760576634167?lang=es",
    "https://www.tiktok.com/@hikvisionmx/video/7488861944389061894?lang=es"
]
USERNAME = 'hikvisionmx'
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ─── AUXILIARES PLAYWRIGHT ──────────────────────────────────────────────────────
async def random_sleep(min_s, max_s):
    await asyncio.sleep(random.uniform(min_s, max_s))

async def scroll_page(page):
    await page.evaluate('window.scrollBy(0, window.innerHeight);')
    await random_sleep(1, 2)

async def handle_captcha(page):
    try:
        # Espera breve para que aparezca el botón
        omitir_button = page.locator('button:has-text("Omitir")')
        if await omitir_button.is_visible(timeout=2000):
            await omitir_button.click()
            await asyncio.sleep(1)

        # Manejo de otros diálogos genéricos
        dialog = page.locator('div[role="dialog"]')
        if await dialog.is_visible(timeout=2000):
            close_button = dialog.locator('[aria-label="Cerrar"]')
            if await close_button.is_visible(timeout=1000):
                await close_button.click()
                await asyncio.sleep(1)
    except Exception:
        pass # Ignora errores si los elementos no aparecen

async def hover_and_get_views(page, element):
    try:
        await element.hover(timeout=5000)
        await random_sleep(0.5, 1)
        return await element.evaluate(
            'el => el.querySelector("strong[data-e2e=\\"video-views\\"]")?.textContent.trim() || "N/A"'
        )
    except Exception as e:
        logging.warning(f"No se pudo hacer hover u obtener vistas: {e}")
        return 'N/A'

# ─── METADATOS + MINIATURA ──────────────────────────────────────────────────────
async def extract_video_info(page, video_url, views):
    await page.goto(video_url, wait_until='domcontentloaded')
    await asyncio.sleep(3) # Pausa para que el contenido de la página del video cargue
    await handle_captcha(page)

    if views == 'N/A':
        views = await page.evaluate(
            '() => document.querySelector("strong[data-e2e=\\"video-views\\"]")?.textContent.trim() || "N/A"'
        )
    desc = await page.evaluate(
        r'''() => {
            let d = '', tags = [];
            // Buscar selectores posibles (desc-span* es la nueva convención que vimos)
            const sels = ['span[data-e2e^="desc-span"]', 'span[data-e2e*="desc-span"]', 'span[data-e2e="new-desc-span"]'];
            let nodes = [];
            for (const s of sels) {
                nodes = Array.from(document.querySelectorAll(s));
                if (nodes.length) break;
            }
            nodes.forEach(el => {
                const text = el.textContent.trim();
                if (text) {
                    d += text + ' ';
                    const m = text.match(/#\S+/g);
                    if(m) tags.push(...m);
                }
            });
            return {description: d.trim(), hashtags: [...new Set(tags)]};
        }'''
    )
    sel = await page.evaluate(
        '''() => {
            const get = sels => {
                for (const s of sels) {
                    const el = document.querySelector(s);
                    if(el?.textContent.trim()) return el.textContent.trim();
                }
                return 'N/A';
            };
            return {
                likes: get(['[data-e2e="like-count"]','[data-e2e="browse-like-count"]']),
                comments: get(['[data-e2e="comment-count"]','[data-e2e="browse-comment-count"]']),
                shares: get(['[data-e2e="share-count"]']),
                bookmarks: get(['[data-e2e="undefined-count"]']),
                music: get(['.css-pvx3oa-DivMusicText']),
                date: get(['span[data-e2e="browser-nickname"] span:last-child'])
            };
        }'''
    )
    info = {
        'url': video_url, 'views': views, 'description': desc['description'],
        'hashtags': desc['hashtags'], **sel, 'timestamp': datetime.now().isoformat(),
    }
    try:
        vid_id = video_url.rstrip('/').split('/video/')[1].split('?')[0]
        key = f'thumbnails/{vid_id}.webp'
        thumb_src = await page.evaluate("() => document.querySelector('picture img')?.src || null")
        exists = False
        try:
            s3.head_object(Bucket=BUCKET, Key=key)
            exists = True
        except ClientError as e:
            if e.response['Error']['Code'] != '404': raise
        if exists:
            info['thumbnail_url'] = f"{PUBLIC_R2}/{key}"
        elif thumb_src:
            res = requests.get(thumb_src, timeout=10)
            res.raise_for_status()
            img = Image.open(BytesIO(res.content)).convert('RGB')
            buf = BytesIO()
            img.save(buf, format='WEBP', quality=80)
            buf.seek(0)
            s3.upload_fileobj(buf, BUCKET, key, ExtraArgs={'ContentType': 'image/webp'})
            info['thumbnail_url'] = f"{PUBLIC_R2}/{key}"
        else:
            info['thumbnail_url'] = None
    except Exception as e:
        logging.error(f"Error subiendo miniatura: {e}", exc_info=True)
        info['thumbnail_url'] = None
    return info

# ─── DESCARGA + SUBIDA VÍDEO ────────────────────────────────────────────────────
def download_and_upload_video(video_url):
    vid_id = video_url.rstrip('/').split('/video/')[1].split('?')[0]
    temp_dir = tempfile.mkdtemp()
    local_path = os.path.join(temp_dir, f"{vid_id}.mp4")
    key = f'videos/{vid_id}.mp4'
    try:
        s3.head_object(Bucket=BUCKET, Key=key)
        return f"{PUBLIC_R2}/{key}"
    except ClientError as e:
        if e.response['Error']['Code'] != '404':
            logging.error(f"Error comprobando existencia de video: {e}", exc_info=True)
            return None
    r2_url = None
    ydl_opts = {
        'outtmpl': local_path, 'format': 'best', 'quiet': True, 'noplaylist': True,
        'logger': logging.getLogger(), 'merge_output_format': 'mp4', 'retries': 3,
        'force_overwrites': True, 'no_warnings': True, 'ignoreerrors': True,
        'writesubtitles': False, 'writeautomaticsub': False, 'postprocessors': [],
        'noprogress': True, 'logtostderr': False, 'simulate': False, 'prefer_ffmpeg': True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.extract_info(video_url, download=True)
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            s3.upload_file(local_path, BUCKET, key, ExtraArgs={'ContentType': 'video/mp4'})
            r2_url = f"{PUBLIC_R2}/{key}"
        else:
            logging.error(f"Archivo de video no encontrado o vacío: {local_path}")
            return None
    except Exception as e:
        logging.error(f"Error descargando/subiendo video: {e}", exc_info=True)
        return None
    finally:
        try:
            if os.path.exists(local_path): os.remove(local_path)
            if os.path.exists(temp_dir): os.rmdir(temp_dir)
        except Exception:
            pass
    return r2_url

# ─── SCRAPE + PROCESO COMPLETO ─────────────────────────────────────────────────
async def scrape_and_upload():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=False)
        context = await browser.new_context(user_agent='Mozilla/5.0')
        
        try:
            with open('cookies.json', 'r') as f:
                cookies = json.load(f)
            allowed_same_site_values = ['Lax', 'Strict', 'None']
            cleaned_cookies = []
            for cookie in cookies:
                if 'sameSite' in cookie:
                    normalized_value = cookie['sameSite'].capitalize()
                    if normalized_value in allowed_same_site_values:
                        cookie['sameSite'] = normalized_value
                    else:
                        cookie['sameSite'] = 'None'
                cleaned_cookies.append(cookie)
            await context.add_cookies(cleaned_cookies)
            logging.info("✅ Cookies de sesión cargadas y limpiadas exitosamente.")
        except FileNotFoundError:
            logging.warning("⚠️ No se encontró 'cookies.json'. El script podría fallar.")
            await browser.close()
            return []
        except Exception as e:
            logging.error(f"❌ Error al procesar las cookies: {e}", exc_info=True)
            await browser.close()
            return []

        page = await context.new_page()
        
        # 👇 CAMBIO CLAVE: Usamos 'domcontentloaded' y añadimos una pausa.
        logging.info(f"Navegando a la página de @{USERNAME}...")
        await page.goto(f'https://www.tiktok.com/@{USERNAME}', wait_until='domcontentloaded')
        logging.info("Página cargada. Esperando 5 segundos para que se asiente...")
        await asyncio.sleep(5)

        await handle_captcha(page)
        
        logging.info("Iniciando scroll para cargar videos...")
        for i in range(10):
            await scroll_page(page)
            await handle_captcha(page)
            logging.info(f"Scroll #{i+1} completado.")
        
        logging.info("Buscando elementos de video...")
        elems = await page.query_selector_all('div[data-e2e="user-post-item"]')
        logging.info(f"Se encontraron {len(elems)} videos en la página.")
        
        views_map = {}
        for el in elems:
            href_element = await el.query_selector("a")
            if href_element:
                href = await href_element.get_attribute("href")
                if href and any(vid_id in href for vid_id in [v.split('/video/')[1].split('?')[0] for v in VIDEOS_A_PROCESAR]):
                    views_map[href] = await hover_and_get_views(page, el)
        
        logging.info(f"Mapa de vistas creado: {views_map}")
        await page.close()
        
        for url in VIDEOS_A_PROCESAR:
            # Normalizar URL para la búsqueda en el mapa
            clean_url_id = url.split('/video/')[1].split('?')[0]
            found_href = next((k for k in views_map if clean_url_id in k), None)
            vws = views_map.get(found_href, 'N/A')

            logging.info(f'Procesando {url}')
            detail = await context.new_page()
            try:
                info = await extract_video_info(detail, url, vws)
                info['video_url'] = download_and_upload_video(url)
                results.append(info)
                logging.info(f'OK {url}')
            except Exception as e:
                logging.error(f'Error procesando {url}: {e}', exc_info=True)
            finally:
                await detail.close()
                await random_sleep(2, 5)
                
        await browser.close()
    return results

async def main():
    data = await scrape_and_upload()
    for item in data:
        print(json.dumps(item, ensure_ascii=False, indent=2))
    
    out_dir = os.path.dirname(__file__) if os.path.dirname(__file__) else '.'
    out_path = os.path.join(out_dir, f'{USERNAME}_tiktok_videos.json')
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f'\nJSON guardado en: {out_path}')

if __name__ == '__main__':
    asyncio.run(main())