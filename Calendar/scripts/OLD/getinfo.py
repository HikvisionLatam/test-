import pandas as pd
import json
import tkinter as tk
from tkinter import filedialog
import os

def convertir_excel_a_json_final(ruta_excel, ruta_json):
    """
    Convierte los datos de eventos desde un archivo Excel a un archivo JSON.
    El script está diseñado para leer las columnas específicas del archivo 
    "Cursos Julio para sitio web.xlsx" y generar un JSON limpio.
    """
    try:
        # Lee el archivo Excel. Se especifica 'str' para evitar problemas de tipo de dato.
        df = pd.read_excel(ruta_excel, engine='openpyxl', dtype=str)

        # Reemplaza los valores 'nan' (comunes en celdas vacías) por texto vacío.
        df.fillna('', inplace=True)

        # --- CAMBIO CLAVE: Mapeo explícito de columnas ---
        # Define cómo se llaman las columnas en tu Excel y cómo quieres que se llamen en el JSON.
        # Esto hace el script más robusto si el orden de las columnas cambia.
        mapeo_columnas = {
            'Título': 'titulo',
            'Tipo de evento': 'tipo_evento',
            'Virtual o Presencial': 'modalidad',
            'Mes': 'mes',
            'Día': 'dia',
            'Hora de inicio': 'hora_inicio',
            'Hora de fin': 'hora_fin',
            'Lugar': 'lugar',
            'Organizador': 'organizador',
            'Dirección': 'direccion',
            'Link de registro': 'link_registro'
        }
        
        # Renombra las columnas del DataFrame según el mapeo.
        df.rename(columns=mapeo_columnas, inplace=True)
        
        cursos_json = []
        # Itera sobre cada fila del archivo Excel.
        for index, row in df.iterrows():
            # Omite la fila si no tiene un título. Esto evita filas vacías en el JSON.
            if not str(row.get('titulo', '')).strip():
                continue

            # Crea un diccionario para el curso actual, comenzando con un ID único.
            curso_actual = {"id": f"{index + 1}"}
            
            # Recorre el mapeo para añadir los datos al diccionario del curso.
            for col_excel, clave_json in mapeo_columnas.items():
                # Verifica si la columna renombrada existe en la fila.
                if clave_json in row:
                    valor_celda = str(row[clave_json]).strip()
                    
                    # Añade el dato solo si no está vacío.
                    # Excepción: mantenemos 'link_registro' aunque sea un guion para tratarlo después.
                    if valor_celda or clave_json == 'link_registro':
                        curso_actual[clave_json] = valor_celda
            
            # Limpieza final: Si el link de registro es un guion '-', lo eliminamos.
            if curso_actual.get('link_registro') == '-':
                del curso_actual['link_registro']

            cursos_json.append(curso_actual)

        if not cursos_json:
            print("⚠️ Advertencia: No se encontraron filas con un 'Título' válido. No se generó el archivo.")
            return False

        # Guarda la lista de cursos en un archivo JSON bien formateado.
        with open(ruta_json, 'w', encoding='utf-8') as f:
            json.dump(cursos_json, f, indent=4, ensure_ascii=False)
        
        return True

    except FileNotFoundError:
        print(f"❌ Error: No se pudo encontrar el archivo en la ruta: {ruta_excel}")
        return False
    except Exception as e:
        print(f"❌ Ocurrió un error inesperado al procesar el archivo: {e}")
        return False

def seleccionar_archivo_excel():
    """Abre una ventana para que el usuario seleccione el archivo Excel."""
    root = tk.Tk()
    root.withdraw()  # Oculta la ventana principal de tkinter
    return filedialog.askopenfilename(
        title="Selecciona tu archivo de Excel (.xlsx)",
        filetypes=[("Archivos de Excel", "*.xlsx"), ("Todos los archivos", "*.*")]
    )

# --- Punto de entrada del script ---
if __name__ == "__main__":
    ruta_entrada_excel = seleccionar_archivo_excel()
    
    if ruta_entrada_excel:
        # Obtiene el directorio donde se está ejecutando el script.
        directorio_script = os.path.dirname(os.path.realpath(__file__))
        nombre_base = os.path.splitext(os.path.basename(ruta_entrada_excel))[0]
        ruta_salida_json = os.path.join(directorio_script, f"{nombre_base}_convertido.json")
        
        print(f"\nProcesando archivo: {ruta_entrada_excel}...")
        
        exito = convertir_excel_a_json_final(ruta_entrada_excel, ruta_salida_json)
        
        if exito:
            print("\n" + "="*60)
            print("✅ ¡Éxito! El archivo JSON se ha creado correctamente.")
            print(f"   El archivo se llama: {os.path.basename(ruta_salida_json)}")
            print(f"   Se guardó en la misma carpeta que tu script.")
            print("="*60 + "\n")
    else:
        print("Operación cancelada. No se seleccionó ningún archivo.")
    
    input("--- Presiona Enter para salir ---")