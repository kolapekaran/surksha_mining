import os
from datetime import datetime
import qrcode

def generate_certificate(data):
    os.makedirs("certificates", exist_ok=True)

    filename = f"cert_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
    path = os.path.join("certificates", filename)

    qr_data = str(data)

    img = qrcode.make(qr_data)
    img.save(path)

    return {
        "certificate_path": path,
        "type": "qr"
    }