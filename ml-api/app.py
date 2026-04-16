
import os
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import io
import datetime
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import uuid

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = "banana_model.pth"
NUM_CLASSES = 4
CLASS_NAMES = ['Raw_Banana', 'Raw_Mango', 'Ripe_Banana', 'Ripe_Mango']
UPLOAD_FOLDER = 'uploads'
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "agri"

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# MongoDB Setup
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db['classifications']

# Load Model
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

def load_model():
    print("Loading model...")
    try:
        from torchvision.models import ResNet18_Weights
        model = models.resnet18(weights=None)
    except ImportError:
        model = models.resnet18(pretrained=False)

    num_ftrs = model.fc.in_features
    model.fc = nn.Linear(num_ftrs, NUM_CLASSES)
    
    if os.path.exists(MODEL_PATH):
        model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
        print("Model weights loaded successfully.")
    else:
        print(f"WARNING: Model file '{MODEL_PATH}' not found. Predictions will be random.")

    model.to(device)
    model.eval()
    return model

model = load_model()

# Preprocessing
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Save image locally
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        # Read file for processing (in memory)
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Save to disk
        image.save(file_path)

        # Preprocess
        tensor = transform(image).unsqueeze(0).to(device)

        # Inference
        with torch.no_grad():
            outputs = model(tensor)
            probabilities = torch.nn.functional.softmax(outputs, dim=1)[0]
        
        # Format results
        results = {
            class_name: float(prob) 
            for class_name, prob in zip(CLASS_NAMES, probabilities)
        }
        
        # Get top prediction
        top_prob, top_idx = torch.max(probabilities, 0)
        predicted_class = CLASS_NAMES[top_idx.item()]
        confidence = float(top_prob)

        # Save to MongoDB
        record = {
            "filename": unique_filename, # Store filename, easy to serve
            "original_name": filename,
            "prediction": predicted_class,
            "confidence": confidence,
            "probabilities": results,
            "timestamp": datetime.datetime.utcnow()
        }
        inserted_id = collection.insert_one(record).inserted_id

        return jsonify({
            'id': str(inserted_id),
            'prediction': predicted_class,
            'confidence': confidence,
            'probabilities': results,
            'image_url': f"http://localhost:8000/uploads/{unique_filename}"
        })

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    try:
        # Fetch last 50 records, sorted by newest first
        cursor = collection.find().sort("timestamp", -1).limit(50)
        history = []
        for doc in cursor:
            doc['_id'] = str(doc['_id'])
            doc['image_url'] = f"http://localhost:8000/uploads/{doc.get('filename')}"
            history.append(doc)
        return jsonify(history)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)
