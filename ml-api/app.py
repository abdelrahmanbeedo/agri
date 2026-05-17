import os
import re
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import io
from datetime import datetime, timezone
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import uuid

try:
    import tflite_runtime.interpreter as tflite
except ImportError:
    from tensorflow import lite as tflite

app = Flask(__name__)
CORS(app)

MODEL_PATH = "fruit_grader.tflite"
UPLOAD_FOLDER = 'uploads'
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "agri"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=1000)
db = client[DB_NAME]
collection = db['classifications']

RAW_CLASSES = [
    'freshapples', 'freshbanana', 'freshbittergroud', 'freshcapsicum',
    'freshcucumber', 'freshokra', 'freshoranges', 'freshpatato',
    'freshpotato', 'freshtamto', 'freshtomato',
    'rottenapples', 'rottenbanana', 'rottenbittergroud', 'rottencapsicum',
    'rottencucumber', 'rottenokra', 'rottenoranges', 'rottenpatato',
    'rottenpotato', 'rottentamto', 'rottentomato',
]

def clean_and_grade(raw):
    name = re.sub(r'^\d+', '', raw).strip()
    n = name.lower()
    if 'fresh' in n:
        fruit = name[name.lower().find('fresh') + 5:].title()
        return 'Grade A', f'Fresh {fruit}'
    if 'rotten' in n:
        fruit = name[name.lower().find('rotten') + 6:].title()
        return 'Grade C', f'Rotten {fruit}'
    return 'Grade B', name.title()

GRADES = []
FRUITS = []
DISPLAY = []
for r in RAW_CLASSES:
    g, f = clean_and_grade(r)
    GRADES.append(g)
    FRUITS.append(f)
    DISPLAY.append(f'{g} - {f}')

INPUT_SIZE = (224, 224)

def load_model():
    print("Loading TFLite fruit grader...")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model file '{MODEL_PATH}' not found.")
    interpreter = tflite.Interpreter(model_path=MODEL_PATH)
    interpreter.allocate_tensors()
    dummy = np.zeros((1, INPUT_SIZE[0], INPUT_SIZE[1], 3), dtype='float32')
    input_details = interpreter.get_input_details()
    interpreter.set_tensor(input_details[0]['index'], dummy)
    interpreter.invoke()
    print("TFLite model loaded and ready.")
    return interpreter

interpreter = None
input_details = None
output_details = None

try:
    interpreter = load_model()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()
except Exception as e:
    print(f"FATAL: Failed to load model: {e}")
    print("The /predict endpoint will return errors until this is fixed.")
    import traceback
    traceback.print_exc()

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        image.save(file_path)

        img_resized = np.array(image.resize(INPUT_SIZE)).astype('float32')
        interpreter.set_tensor(input_details[0]['index'], np.expand_dims(img_resized, 0))
        interpreter.invoke()
        probs = interpreter.get_tensor(output_details[0]['index'])[0]

        top_idx = int(np.argmax(probs))
        grade = GRADES[top_idx]
        fruit = FRUITS[top_idx]
        confidence = float(probs[top_idx])

        grade_conf = {}
        for i, g in enumerate(GRADES):
            grade_conf[g] = grade_conf.get(g, 0.0) + float(probs[i])

        sorted_indices = np.argsort(probs)[::-1]
        top5 = {DISPLAY[i]: float(probs[i]) for i in sorted_indices[:5]}

        record = {
            "filename": unique_filename,
            "original_name": filename,
            "prediction": RAW_CLASSES[top_idx],
            "fruit": fruit,
            "grade": grade,
            "confidence": confidence,
            "grade_confidence": grade_conf,
            "probabilities": top5,
            "timestamp": datetime.now(timezone.utc)
        }
        try:
            inserted_id = str(collection.insert_one(record).inserted_id)
        except Exception as db_err:
            print(f"Warning: could not save to MongoDB: {db_err}")
            inserted_id = None

        return jsonify({
            'id': inserted_id,
            'prediction': RAW_CLASSES[top_idx],
            'grade': grade,
            'fruit': fruit,
            'confidence': confidence,
            'grade_confidence': grade_conf,
            'probabilities': top5,
            'image_url': f"http://localhost:8000/uploads/{unique_filename}"
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        cursor = collection.find().sort("timestamp", -1).limit(50)
        history = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['image_url'] = f"http://localhost:8000/uploads/{doc.get('filename')}"
            history.append(doc)
        return jsonify(history)
    except Exception:
        return jsonify([])

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
