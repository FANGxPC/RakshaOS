import base64
from io import BytesIO
from PIL import Image
import pytesseract
import logging

logger = logging.getLogger(__name__)

class OCRService:
    @staticmethod
    def extract_text(base64_image: str) -> str:
        try:
            # Handle data URI scheme if present
            if "," in base64_image:
                base64_image = base64_image.split(",")[1]
                
            image_data = base64.b64decode(base64_image)
            image = Image.open(BytesIO(image_data))
            
            # Use English by default, fallback to Hindi + English if available
            try:
                text = pytesseract.image_to_string(image, lang='eng+hin')
            except Exception as e:
                logger.warning(f"Failed to use 'eng+hin', falling back to 'eng'. Error: {str(e)}")
                text = pytesseract.image_to_string(image, lang='eng')
                
            return text.strip()
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            return ""
