import io
from flask import Flask, request, jsonify
from PIL import Image
import pytesseract
import spacy

app = Flask(__name__)

# Load standard English model
nlp = spacy.load("en_core_web_sm")

@app.route('/analyze-stream', methods=['POST'])
def analyze_document_stream():
    try:
        # 1. Grab metadata and text content if sent by node libraries
        text_content = request.form.get('text_content', '')
        file_bytes = request.files.get('file')

        # 2. If it's an image file and no text was extracted yet, perform Tesseract OCR
        if file_bytes and not text_content:
            image_data = file_bytes.read()
            image = Image.open(io.BytesIO(image_data))
            text_content = pytesseract.image_to_string(image)

        # 3. Perform spaCy Named Entity Recognition (NER) analysis
        entities = []
        if text_content.strip():
            doc = nlp(text_content)
            entities = [
                {"text": ent.text, "label": ent.label_} 
                for ent in doc.ents
            ]

        return jsonify({
            "success": True,
            "extracted_text": text_content.strip(),
            "entities": entities
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True)