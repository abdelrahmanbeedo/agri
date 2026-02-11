import torch
import torch.nn as nn
import torch.optim as optim
import torchvision.models as models
import torchvision.transforms as transforms
from datasets import load_dataset

# ---- Exact replication of the notebook ----

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Step 1: Load dataset
print("📥 Loading dataset from Hugging Face...")
dataset = load_dataset("darthraider/fruit-ripeness-detection-dataset", split='train')

# Step 2: Prepare data - transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def apply_transform(example):
    example['image'] = transform(example['image'].convert('RGB'))
    return example

print("🔄 Applying transformations...")
dataset = dataset.map(apply_transform)

# Use natural labels from the dataset
class_names = dataset.features['label'].names
num_classes = len(class_names)
print(f"Number of classes: {num_classes} ({class_names})")

# Step 3: DataLoader
batch_size = 32
dataset.set_format(type='torch', columns=['image', 'label'])
dataloader = torch.utils.data.DataLoader(dataset, batch_size=batch_size, shuffle=True)

# Step 4: Define model (ResNet18 pretrained)
print("🏗️  Setting up ResNet18 model...")
try:
    from torchvision.models import ResNet18_Weights
    model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
except ImportError:
    model = models.resnet18(pretrained=True)

num_ftrs = model.fc.in_features
model.fc = nn.Linear(num_ftrs, 4)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

# Step 5: Train the model
model.to(device)
num_epochs = 5

print(f"🚀 Starting training for {num_epochs} epochs...")
for epoch in range(num_epochs):
    model.train()
    running_loss = 0.0
    for batch in dataloader:
        images = batch['image'].to(device)
        labels = batch['label'].to(device)

        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels) # Labels are now integers
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * images.size(0)

    epoch_loss = running_loss / len(dataset)
    print(f"✅ Epoch [{epoch+1}/{num_epochs}], Loss: {epoch_loss:.4f}")

# Step 6: Evaluate on test set
print("📊 Evaluating on test set...")
dataset_test = load_dataset("darthraider/fruit-ripeness-detection-dataset", split='test')
dataset_test = dataset_test.map(apply_transform)
dataset_test.set_format(type='torch', columns=['image', 'label'])
dataloader_test = torch.utils.data.DataLoader(dataset_test, batch_size=batch_size, shuffle=False)

model.eval()
correct = 0
total = 0
with torch.no_grad():
    for batch in dataloader_test:
        images = batch['image'].to(device)
        labels = batch['label'].to(device)
        outputs = model(images)
        preds = outputs.argmax(dim=1)
        total += labels.size(0)
        correct += (preds == labels).sum().item()

accuracy = 100.0 * correct / total
print(f"🎯 Test Accuracy: {accuracy:.2f}%")
to delete in the front end to mongo
# Step 7: Save model
print("💾 Saving model to banana_model.pth...")
torch.save(model.state_dict(), "banana_model.pth")
print("🎉 Model saved successfully!")
