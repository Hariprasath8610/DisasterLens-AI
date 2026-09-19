import re
import urllib.parse
from typing import Dict, Any

def clean_whatsapp_number(phone_number: str) -> str:
    """
    Cleans phone number for WhatsApp wa.me links:
    - Removes '+', '-', spaces, parentheses.
    - If 10 digits (standard Indian mobile), prepends country code '91'.
    """
    cleaned = re.sub(r"[^\d]", "", (phone_number or "").strip())
    if len(cleaned) == 10:
        cleaned = "91" + cleaned
    return cleaned

def create_whatsapp_alert(
    phone_number: str,
    risk_level: str = "HIGH",
    location: str = "Karur"
) -> Dict[str, Any]:
    """
    Creates a pre-filled WhatsApp Click-to-Chat URL.
    No WhatsApp API key required. User presses Send inside WhatsApp.
    Recipient format: wa.me/<country_code><number>?text=<encoded_text>
    """
    clean_phone = clean_whatsapp_number(phone_number)
    
    # Message formatting matching DisasterLens AI emergency alert specifications
    message = (
        f"🚨 DisasterLens AI Alert\n\n"
        f"Risk Level: {risk_level}\n"
        f"Location: {location}\n\n"
        f"Please stay alert and follow local safety instructions."
    )
    
    encoded_message = urllib.parse.quote(message)
    whatsapp_url = f"https://wa.me/{clean_phone}?text={encoded_message}"
    
    return {
        "success": True,
        "mode": "whatsapp_link",
        "phone_number": clean_phone,
        "message": message,
        "whatsapp_url": whatsapp_url
    }
