import asyncio
import os
import json
import logging
from datetime import datetime
from playwright.async_api import async_playwright
import yt_dlp
import requests
from PIL import Image
from io import BytesIO

# Configuración de logging para mejor depuración
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Variables de configuración
DOWNLOAD_VIDEOS = True # Puedes cambiar a False si no quieres descargar los videos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
COOKIE_FILE = os.path.join(BASE_DIR, "cookies.json")

# Directorio para thumbnails optimizados
IMAGES_DIR = os.path.join(BASE_DIR, "last-images")
os.makedirs(IMAGES_DIR, exist_ok=True) # Asegura que el directorio exista

def ajustar_ruta_local_filename(ruta_absoluta, username='lasthikvisionlatam'):
    """Ajusta la ruta de un archivo local para que sea relativa al usuario."""
    ruta_unix = ruta_absoluta.replace('\\', '/') # Normaliza a barras UNIX
    idx = ruta_unix.rfind(f"/{username}/")
    if idx != -1:
        return ruta_unix[idx:]
    idx2 = ruta_unix.find(username)
    if idx2 != -1:
        return '/' + ruta_unix[idx2:]
    filename = os.path.basename(ruta_unix)
    return f"/{username}/{filename}"

async def random_sleep(min_seconds, max_seconds):
    """Pausa aleatoria para simular comportamiento humano y evitar detecciones."""
    import random
    await asyncio.sleep(random.uniform(min_seconds, max_seconds))

async def scroll_page(page):
    """Hace scroll en la página para cargar más contenido."""
    await page.evaluate("window.scrollBy(0, window.innerHeight);")
    await random_sleep(1, 2)

async def handle_captcha(page, cookies_exist):
    """Intenta manejar el CAPTCHA o el banner de cookies si aparece."""
    try:
        # Intenta omitir si hay cookies existentes (puede ser un banner de "Continuar")
        if cookies_exist:
            btn = page.locator("button", has_text="Omitir")
            if await btn.count() and await btn.is_visible():
                logging.info("Botón 'Omitir' (con cookies) encontrado, haciendo clic.")
                await btn.click()
                await asyncio.sleep(2)
                return

        # Maneja el diálogo de CAPTCHA/verificación si aparece
        dialog = page.locator('div[role="dialog"]')
        if await dialog.count() and await dialog.is_visible():
            logging.warning("Diálogo de CAPTCHA/verificación detectado. Esperando que desaparezca.")
            # Espera a que el diálogo desaparezca (puede ser manual si es un CAPTCHA complejo)
            await page.wait_for_selector('div[role="dialog"]', state='detached', timeout=300000)
            await asyncio.sleep(0.5)
            # Intenta omitir nuevamente si es un banner post-verificación y no había cookies antes
            if not cookies_exist:
                btn2 = page.locator("button", has_text="Omitir")
                if await btn2.count() and await btn2.is_visible():
                    logging.info("Botón 'Omitir' (sin cookies) encontrado, haciendo clic.")
                    await btn2.click()
                    await asyncio.sleep(2)
            return
    except Exception as e:
        logging.error(f"Error al manejar CAPTCHA o banner: {e}")

async def hover_and_get_views(page, element):
    """Pasa el ratón sobre un elemento y extrae las vistas del video."""
    try:
        await element.hover()
        await random_sleep(0.5, 1)
        # Evalúa el JavaScript en el navegador para obtener el texto de las vistas
        return await element.evaluate("""
            el => {
                const v = el.querySelector('strong[data-e2e="video-views"]');
                return v ? v.textContent.trim() : 'N/A';
            }
        """)
    except Exception as e:
        logging.warning(f"No se pudieron obtener las vistas al hacer hover: {e}")
        return 'N/A'

async def extract_video_info(page, video_url, views):
    """Extrae la información detallada de un video de TikTok."""
    await page.goto(video_url, wait_until="networkidle")
    await random_sleep(2, 4)
    cookies_exist = os.path.exists(COOKIE_FILE)
    await handle_captcha(page, cookies_exist)

    # Extraer descripción y hashtags
    desc_data = await page.evaluate("""
    () => {
        let desc = '', tags = [];
        // Busca spans de descripción y extrae texto y hashtags
        document.querySelectorAll('span[data-e2e="new-desc-span"]').forEach(el => {
            desc += el.textContent.trim() + ' ';
            const m = el.textContent.match(/#\\S+/g); // Regex para hashtags
            if (m) tags.push(...m);
        });
        // Busca hashtags adicionales en enlaces de búsqueda
        document.querySelectorAll('a.search-common-link strong').forEach(s => {
            const t = s.textContent.trim();
            desc += t + ' ';
            tags.push(t);
        });
        return { description: desc.trim(), hashtags: tags };
    }
    """)
    description = desc_data['description']
    hashtags = desc_data['hashtags']
    first_tag = hashtags[0] if hashtags else ''

    # Extraer likes, comentarios, shares, bookmarks, título de la música y fecha
    video_info_selectors = await page.evaluate("""
    () => {
        const get = sels => {
            for (let sel of sels) {
                const el = document.querySelector(sel);
                if (el && el.textContent.trim()) return el.textContent.trim();
            }
            return 'N/A';
        };
        return {
            likes: get(['[data-e2e="like-count"]','[data-e2e="browse-like-count"]']),
            comments: get(['[data-e2e="comment-count"]','[data-e2e="browse-comment-count"]']),
            shares: get(['[data-e2e="share-count"]']),
            bookmarks: get(['[data-e2e="undefined-count"]']),
            musicTitle: get(['.css-pvx3oa-DivMusicText']),
            date: get(['span[data-e2e="browser-nickname"] span:last-child'])
        };
    }
    """)
    # Si las vistas no se obtuvieron por hover, intenta obtenerlas de nuevo
    if views == 'N/A':
        views = await page.evaluate("""
            () => {
                const v = document.querySelector('strong[data-e2e="video-views"]');
                return v ? v.textContent.trim() : 'N/A';
            }
        """)

    # Combina toda la información del video
    video_info = {
        'url': video_url,
        'views': views,
        'description': description,
        'hashtags': hashtags,
        'first_hashtag': first_tag,
        'timestamp': datetime.now().isoformat(),
        **video_info_selectors # Agrega los datos extraídos por los selectores
    }

    # --- BLOQUE THUMBNAIL: extraer desde <picture> y optimizar a WebP <300KB ---
    try:
        vid_id = video_url.rstrip('/').split('/video/')[1].split('?')[0]
        # Selector robusto: busca <img> dentro de <picture> que está dentro de
        # un div con la clase 'css-1e263gw-StyledVideoBlurBackground'
        thumb_src = await page.evaluate("""
        () => {
            const pic_img = document.querySelector('div.css-1e263gw-StyledVideoBlurBackground picture img');
            return pic_img ? pic_img.src : null;
        }
        """)
        if thumb_src:
            logging.info(f"URL de thumbnail encontrada: {thumb_src}")
            resp = requests.get(thumb_src, timeout=10)
            resp.raise_for_status() # Lanza excepción para códigos de estado HTTP erróneos
            img = Image.open(BytesIO(resp.content)).convert('RGB') # Abre la imagen y convierte a RGB
            
            quality = 80
            buf = BytesIO()
            img.save(buf, format='WEBP', quality=quality)
            # Reduce la calidad hasta que el archivo sea menor de 300KB o calidad mínima de 10
            while buf.tell() > 300 * 1024 and quality > 10:
                quality -= 10
                buf = BytesIO()
                img.save(buf, format='WEBP', quality=quality)
            
            filename = f"{vid_id}_poster.webp"
            path = os.path.join(IMAGES_DIR, filename)
            with open(path, 'wb') as f:
                f.write(buf.getvalue())
            video_info['thumbnail_url'] = f"/images/{filename}" # Ruta relativa para el JSON
            logging.info(f"Thumbnail optimizado guardado en {path} (Tamaño: {buf.tell() / 1024:.2f} KB)")
        else:
            logging.warning("No se encontró la imagen de la miniatura con el selector 'div.css-1e263gw-StyledVideoBlurBackground picture img'.")
            video_info['thumbnail_url'] = None # Asigna None si no se encuentra
    except Exception as e:
        logging.error(f"Error al procesar el thumbnail para {video_url}: {e}")
        video_info['thumbnail_url'] = None # Asigna None en caso de error
    # -------------------------------------------------------------

    return video_info

def download_tiktok_video(video_url, save_path):
    """Descarga un video de TikTok usando yt-dlp."""
    opts = {
        'outtmpl': os.path.join(save_path, '%(id)s.%(ext)s'),
        'format': 'best',
        'quiet': True,
        'noplaylist': True, # Asegura que no intente descargar playlists
    }
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            fn = ydl.prepare_filename(info) # Obtiene el nombre de archivo final
            logging.info(f"Video descargado: {fn}")
            return fn
    except Exception as e:
        logging.error(f"Error descargando video {video_url}: {e}")
        return None

async def save_cookies(context):
    """Guarda las cookies del navegador en un archivo JSON."""
    cookies = await context.cookies()
    with open(COOKIE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cookies, f, ensure_ascii=False, indent=2)
    logging.info("Cookies guardadas.")

async def load_cookies(context):
    """Carga las cookies desde un archivo JSON al navegador."""
    if os.path.exists(COOKIE_FILE):
        with open(COOKIE_FILE, 'r', encoding='utf-8') as f:
            cookies = json.load(f)
        await context.add_cookies(cookies)
        logging.info("Cookies cargadas.")
        return True
    return False

async def scrape_tiktok_profile(username):
    """
    Rasca (scrapea) los datos de un perfil de TikTok,
    extrae información de videos y descarga miniaturas.
    """
    async with async_playwright() as p:
        # Lanza el navegador Chromium en modo no headless (visible)
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            viewport={'width':1280,'height':720}, # Tamaño de la ventana
            user_agent=( # User-agent para simular un navegador común
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/91.0.4472.124 Safari/537.36'
            )
        )

        # Intenta cargar cookies al inicio
        cookies_loaded = await load_cookies(context)

        page = await context.new_page()
        await page.goto(f"https://www.tiktok.com/@{username}", wait_until="networkidle")
        await handle_captcha(page, cookies_loaded) # Maneja CAPTCHA/cookies
        await save_cookies(context) # Guarda las cookies actualizadas

        # Desplázate varias veces para cargar más videos
        logging.info("Realizando scroll para cargar más videos...")
        for _ in range(10): # Ajusta este número según cuántos videos quieres cargar
            await scroll_page(page)
            await handle_captcha(page, os.path.exists(COOKIE_FILE)) # Chequea CAPTCHA/cookies durante el scroll

        # Selecciona los elementos de los videos
        elems = await page.query_selector_all('div[data-e2e="user-post-item"]')
        elems = elems[3:11]  # Procesa 8 videos (ajusta el rango si quieres más o menos)
        logging.info(f"Se encontraron {len(elems)} videos para procesar.")

        video_urls = []
        for el in elems:
            href = await el.evaluate('e => e.querySelector("a").href') # Obtiene el enlace del video
            vws = await hover_and_get_views(page, el) # Obtiene las vistas
            video_urls.append((href, vws))

        # Cargar datos anteriores si existen para actualizar en lugar de sobrescribir
        json_file = os.path.join(BASE_DIR, f"{username}_last_tiktok_videos.json")
        previous_data = []
        if os.path.exists(json_file):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    previous_data = json.load(f)
                logging.info(f"Cargados {len(previous_data)} videos existentes de {json_file}.")
            except json.JSONDecodeError as e:
                logging.error(f"Error al leer el archivo JSON existente: {e}. Se creará un nuevo archivo.")
                previous_data = []
        videos_dict = {v['url']: v for v in previous_data} # Diccionario para fácil actualización

        # Extraer información detallada y descargar videos/miniaturas
        for url, vws in video_urls:
            logging.info(f"Extrayendo información para: {url}")
            info = await extract_video_info(page, url, vws)
            if DOWNLOAD_VIDEOS:
                dst = os.path.join(BASE_DIR, username)
                os.makedirs(dst, exist_ok=True)
                fn = download_tiktok_video(url, dst)
                if fn:
                    info['local_filename'] = ajustar_ruta_local_filename(fn, username)
            videos_dict[url] = info # Agrega o actualiza el video en el diccionario

        await browser.close()

        # Convertir el diccionario a una lista, manteniendo el orden original de la página
        ordered_videos = [videos_dict[url] for url, _ in video_urls]
        ordered_videos.reverse() # Invierte para que los videos más recientes aparezcan primero si es necesario.
        return ordered_videos

async def main():
    """Función principal para ejecutar el scraping."""
    username = "hikvisionlatam" # Define el nombre de usuario de TikTok aquí
    videos_data = await scrape_tiktok_profile(username)
    
    out_file_path = os.path.join(BASE_DIR, f"{username}_last_tiktok_videos.json")
    with open(out_file_path, 'w', encoding='utf-8') as f:
        json.dump(videos_data, f, indent=2, ensure_ascii=False)
    print(f"Datos de los videos guardados exitosamente en: {out_file_path}")

if __name__ == "__main__":
    asyncio.run(main())