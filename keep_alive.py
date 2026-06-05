import time
import urllib.request
import datetime

URL = "https://isht-webapp.onrender.com/health"
INTERVAL_SECONDS = 240  # 4 minutos (menor a los 15 min de timeout de Render)

def keep_alive():
    print("=== INICIANDO SCRIPT LOCAL DE KEEP-ALIVE (HIDATA STAFF ENGINEER 100x) ===")
    print(f"Objetivo: Mantener caliente el backend de Render en {URL}")
    print(f"Intervalo de ping: cada {INTERVAL_SECONDS / 60:.1f} minutos.\n")
    
    pings_count = 0
    while True:
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        try:
            # Enviamos una petición simple GET
            with urllib.request.urlopen(URL, timeout=10) as response:
                status = response.getcode()
                content = response.read().decode("utf-8")
                pings_count += 1
                print(f"[{now}] Ping #{pings_count} - Status: {status} - Resp: {content}")
        except Exception as e:
            print(f"[{now}] Error al enviar ping: {e}")
            
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    try:
        keep_alive()
    except KeyboardInterrupt:
        print("\n=== Script de Keep-Alive detenido por el usuario. ===")
