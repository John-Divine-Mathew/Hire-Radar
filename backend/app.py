import os
import logging
from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import spacy

# Add this line if Tesseract is installed in the default Windows location:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)


log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# Load small English model (ensure you run: python -m spacy download en_core_web_sm)
nlp = spacy.load("en_core_web_sm")

@app.route('/analyze', methods=['POST'])
def analyze_document():
    if 'file_path' not in request.json:
        return jsonify({"error": "Missing file_path parameter"}), 400
    
    file_path = request.json['file_path']
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found on disk"}), 404

    ext = os.path.splitext(file_path)[1].lower()
    extracted_text = ""
    is_image = ext in ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']

    try:
        # 1. OCR text extraction for images using Tesseract
        if is_image:
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image)
        else:
            # For non-images, the Node.js search service will pass text contents
            extracted_text = request.json.get('text_content', '')

        # 2. Advanced Text NLP Enrichment using spaCy
        entities = []
        if extracted_text.strip():
            doc = nlp(extracted_text)
            # Pull locations, organizations, and custom entity criteria
            entities = [
                {"text": ent.text, "label": ent.label_}
                for ent in doc.ents
                if ent.label_ in ["ORG", "GPE", "LOC", "PERSON", "PRODUCT"]
            ]

        return jsonify({
            "success": True,
            "extracted_text": extracted_text if is_image else None,
            "entities": entities
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # Force Flask to bind to 0.0.0.0 so that internal connections work uniformly
    app.run(host='0.0.0.0', port=5001, debug=True)