import asyncio
import os
import json
import logging
import random
from datetime import datetime
from dotenv import load_dotenv
import boto3
from botocore.config import Config
from playwright.async_api import async_playwright
import yt_dlp
import requests
from PIL import Image
from io import BytesIO

# ─── CARGAR CONFIGURACIÓN ──────────────────────────────────────────────────────
load_dotenv()  # busca un archivo .env junto a este script

ACCOUNT_ID = os.getenv('CF_ACCOUNT_ID')
ACCESS_KEY = os.getenv('CF_ACCESS_KEY_ID')
SECRET_KEY = os.getenv('CF_SECRET_ACCESS_KEY')
BUCKET     = os.getenv('CF_R2_BUCKET')
ENDPOINT   = f"https://{ACCOUNT_ID}.r2.cloudflarestorage.com"

# Cliente S3 compatible con Cloudflare R2
s3 = boto3.client(
    "s3",
    endpoint_url=ENDPOINT,
    aws_access_key_id=ACCESS_KEY,
    aws_secret_access_key=SECRET_KEY,
    region_name="auto",
    config=Config(s3={"addressing_style": "path"})
)

# ─── CONSTANTES Y DIRECTORIOS ──────────────────────────────────────────────────
VIDEOS_A_PROCESAR = [
    "https://www.tiktok.com/@hikvisionlatam/video/7518742393085054214",
    "https://www.tiktok.com/@hikvisionlatam/video/7516918173078228229",
    "https://www.tiktok.com/@hikvisionlatam/video/7498116270617857335",
    "https://www.tiktok.com/@hikvisionlatam/video/7491838741091192119",
    "https://www.tiktok.com/@hikvisionlatam/video/7510300279997320454",
    "https://www.tiktok.com/@hikvisionlatam/video/7502229067761093893",
]
USERNAME = "hikvisionlatam"
DOWNLOAD_VIDEOS = True

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(BASE_DIR, "cookies.json")
IMAGES_DIR  = os.path.join(BASE_DIR, "images")
os.makedirs(IMAGES_DIR, exist_ok=True)


# ─── FUNCIONES AUXILIARES ──────────────────────────────────────────────────────
def ajustar_ruta_local_filename(ruta_absoluta, username=USERNAME):
    ruta_unix = ruta_absoluta.replace("\\", "/")
    idx = ruta_unix.rfind(f"/{username}/")
    if idx != -1:
        return ruta_unix[idx:]
    idx2 = ruta_unix.find(username)
    if idx2 != -1:
        return "/" + ruta_unix[idx2:]
    filename = os.path.basename(ruta_unix)
    return f"/{username}/{filename}"


async def random_sleep(min_seconds, max_seconds):
    await asyncio.sleep(random.uniform(min_seconds, max_seconds))


async def scroll_page(page):
    await page.evaluate("window.scrollBy(0, window.innerHeight);")
    await random_sleep(1, 2)


async def save_cookies(context):
    try:
        cookies = await context.cookies()
        with open(COOKIE_FILE, "w", encoding="utf-8") as f:
            json.dump(cookies, f, ensure_ascii=False, indent=2)
        logging.info("Cookies guardadas exitosamente.")
    except Exception as e:
        logging.error(f"Error al guardar las cookies: {e}")


async def load_cookies(context):
    if os.path.exists(COOKIE_FILE):
        try:
            with open(COOKIE_FILE, "r", encoding="utf-8") as f:
                cookies = json.load(f)
            await context.add_cookies(cookies)
            logging.info("Cookies cargadas exitosamente.")
            return True
        except Exception as e:
            logging.error(f"Error al cargar las cookies: {e}")
    return False


async def handle_captcha(page):
    try:
        omitir_btn = page.locator("button", has_text="Omitir")
        if await omitir_btn.count() and await omitir_btn.is_visible():
            await omitir_btn.click()
            await asyncio.sleep(2)
        dialog = page.locator('div[role="dialog"]')
        if await dialog.count() and await dialog.is_visible():
            await page.wait_for_selector('div[role="dialog"]', state="detached", timeout=300000)
    except Exception:
        pass


async def hover_and_get_views(page, element):
    try:
        await element.hover()
        await random_sleep(0.5, 1)
        return await element.evaluate(
            "el => el.querySelector('strong[data-e2e=\"video-views\"]')?.textContent.trim() || 'N/A'"
        )
    except Exception:
        return "N/A"


async def extract_video_info(page, video_url, views):
    await page.goto(video_url, wait_until="networkidle")
    await random_sleep(2, 4)
    await handle_captcha(page)

    if views == "N/A":
        views = await page.evaluate(
            "(() => document.querySelector('strong[data-e2e=\"video-views\"]')?.textContent.trim() || 'N/A')()"
        )

    desc_data = await page.evaluate(
        """() => {
            let desc = "", tags = [];
            document.querySelectorAll('span[data-e2e="new-desc-span"]').forEach(el => {
                desc += el.textContent.trim() + " ";
                const m = el.textContent.match(/#\\S+/g);
                if (m) tags.push(...m);
            });
            document.querySelectorAll('a.search-common-link strong').forEach(s => {
                desc += s.textContent.trim() + " ";
                tags.push(s.textContent.trim());
            });
            return { description: desc.trim(), hashtags: [...new Set(tags)] };
        }"""
    )
    description = desc_data["description"]
    hashtags    = desc_data["hashtags"]
    first_tag   = hashtags[0] if hashtags else ""

    selectors = await page.evaluate(
        """() => {
            const get = sels => {
                for (let sel of sels) {
                    const el = document.querySelector(sel);
                    if (el?.textContent.trim()) return el.textContent.trim();
                }
                return 'N/A';
            };
            return {
                likes:     get(['[data-e2e="like-count"]','[data-e2e="browse-like-count"]']),
                comments:  get(['[data-e2e="comment-count"]','[data-e2e="browse-comment-count"]']),
                shares:    get(['[data-e2e="share-count"]']),
                bookmarks: get(['[data-e2e="undefined-count"]']),
                musicTitle:get(['.css-pvx3oa-DivMusicText']),
                date:      get(['span[data-e2e="browser-nickname"] span:last-child'])
            };
        }"""
    )

    info = {
        "url":          video_url,
        "views":        views,
        "description":  description,
        "hashtags":     hashtags,
        "first_hashtag":first_tag,
        "timestamp":    datetime.now().isoformat(),
        **selectors
    }

    # Descargar y optimizar miniatura
    try:
        vid_id    = video_url.rstrip("/").split("/video/")[1].split("?")[0]
        thumb_src = await page.evaluate(
            "() => document.querySelector('div.css-1e263gw-StyledVideoBlurBackground picture img')?.src"
        )
        if thumb_src:
            resp = requests.get(thumb_src, timeout=10)
            resp.raise_for_status()
            img = Image.open(BytesIO(resp.content)).convert("RGB")
            quality = 80
            buf = BytesIO()
            img.save(buf, format="WEBP", quality=quality)
            while buf.tell() > 300 * 1024 and quality > 10:
                quality -= 10
                buf = BytesIO()
                img.save(buf, format="WEBP", quality=quality)
            fn   = f"{vid_id}_poster.webp"
            path = os.path.join(IMAGES_DIR, fn)
            with open(path, "wb") as f:
                f.write(buf.getvalue())
            info["thumbnail_url"] = f"/images/{fn}"
    except Exception:
        info["thumbnail_url"] = None

    return info


def download_tiktok_video(video_url, save_path):
    opts = {
        "outtmpl":     os.path.join(save_path, "%(id)s.%(ext)s"),
        "format":      "best",
        "quiet":       True,
        "noplaylist":  True,
        "cookiefile":  COOKIE_FILE if os.path.exists(COOKIE_FILE) else None
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            fn   = ydl.prepare_filename(info)
            logging.info(f"Video descargado: {fn}")
            return fn
    except Exception as e:
        logging.error(f"Error descargando video {video_url}: {e}")
        return None


def upload_to_r2(local_path, object_key):
    """
    Sube local_path a R2 bajo object_key y devuelve la URL pública.
    """
    s3.upload_file(local_path, BUCKET, object_key)
    return f"{ENDPOINT}/{BUCKET}/{object_key}"


async def scrape_videos_especificos(video_urls, username):
    resultados = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(user_agent="Mozilla/5.0")
        await load_cookies(context)

        # Fase 1: mapa de vistas usando un sólo "profile" page
        profile = await context.new_page()
        await profile.goto(f"https://www.tiktok.com/@{username}", wait_until="networkidle")
        await handle_captcha(profile)
        for _ in range(5):
            await scroll_page(profile)
            await handle_captcha(profile)
        elems = await profile.query_selector_all('div[data-e2e="user-post-item"]')
        views_map = {}
        for el in elems:
            href = await el.evaluate('e => e.querySelector("a").href')
            if href in video_urls:
                views_map[href] = await hover_and_get_views(profile, el)
        await profile.close()

        # Fase 2: detalle + subida, UNA PÁGINA POR VÍDEO
        for url in video_urls:
            logging.info(f"--- Procesando video: {url} ---")
            vws = views_map.get(url, "N/A")
            try:
                # 1) Abrir nueva pestaña
                detail_page = await context.new_page()
                # 2) Extraer info en esa pestaña
                info = await extract_video_info(detail_page, url, vws)
                # 3) Descargar, subir y añadir campos
                if DOWNLOAD_VIDEOS:
                    save_dir = os.path.join(BASE_DIR, username)
                    os.makedirs(save_dir, exist_ok=True)
                    fn = download_tiktok_video(url, save_dir)
                    if fn:
                        info["local_filename"] = ajustar_ruta_local_filename(fn, username)
                        key = f"videos/{os.path.basename(fn)}"
                        info["r2_url"] = upload_to_r2(fn, key)
                resultados.append(info)
            except Exception as e:
                logging.error(f"FALLO al procesar {url}: {e}", exc_info=True)
            finally:
                # 4) ¡Cerrar SIEMPRE la pestaña!
                try:
                    await detail_page.close()
                except:
                    pass
            await random_sleep(3, 6)

        await save_cookies(context)
        await browser.close()
    return resultados


async def main():
    logging.info(f"Iniciando scraping de {len(VIDEOS_A_PROCESAR)} vídeos de '{USERNAME}'.")
    data = await scrape_videos_especificos(VIDEOS_A_PROCESAR, USERNAME)

    # Imprime cada registro JSON en consola (una línea por vídeo)
    for item in data:
        print(json.dumps(item, ensure_ascii=False))

    # Guarda un JSON compacto en fichero
    out_file = os.path.join(BASE_DIR, f"{USERNAME}_tiktok_videos.json")
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, separators=(",", ":"), ensure_ascii=False)
    print("➤ Datos guardados en:", out_file)


if __name__ == "__main__":
    asyncio.run(main())
