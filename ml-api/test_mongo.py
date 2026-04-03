
from pymongo import MongoClient

uri = "mongodb://localhost:27017/"
try:
    client = MongoClient(uri, serverSelectionTimeoutMS=2000)
    client.server_info() # Trigger connection
    print(f"✅ Successfully connected to MongoDB at {uri}")
    
    db = client["agri"]
    print(f"📂 Database: {db.name}")
    
    col = db["classifications"]
    count = col.count_documents({})
    print(f"📊 Current documents in 'classifications': {count}")
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
