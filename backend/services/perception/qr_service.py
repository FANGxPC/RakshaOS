import base64
from io import BytesIO
from PIL import Image
import logging
from typing import List

try:
    from pyzbar.pyzbar import decode
    ZBAR_AVAILABLE = True
except ImportError:
    ZBAR_AVAILABLE = False


logger = logging.getLogger(__name__)

class QRService:
    @staticmethod
    def extract_urls(base64_image: str) -> List[str]:
        try:
            if not ZBAR_AVAILABLE:
                logger.error("zbar library not available on this system. Cannot decode QR codes.")
                return []
                
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
                
            image_data = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_data))
            
            decoded_objects = decode(image)
            urls = []
            
            for obj in decoded_objects:
                data = obj.data.decode('utf-8')
                if data.startswith('http://') or data.startswith('https://') or data.startswith('upi://'):
                    urls.append(data)
                    
            return urls
        except Exception as e:
            logger.error(f"Error decoding QR code: {str(e)}")
            return []
