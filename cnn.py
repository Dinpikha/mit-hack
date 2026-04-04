import streamlit as st
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from PIL import Image

# Load model
model = load_model("severity_model.h5")

classes = ['high_severity', 'low_severity', 'moderate_severity']

def predict(img):
    img = img.resize((224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = img_array / 255.0

    pred = model.predict(img_array)
    return classes[np.argmax(pred)]

# UI
st.title("🚑 AI Emergency Severity Detection System")

st.write("Upload or capture an injury image")

option = st.radio("Choose input method:", ["Upload Image", "Use Camera"])

img = None

if option == "Upload Image":
    file = st.file_uploader("Upload Image", type=["jpg", "png"])
    if file:
        img = Image.open(file)

else:
    cam = st.camera_input("Capture Image")
    if cam:
        img = Image.open(cam)

if img:
    st.image(img, caption="Input Image", use_column_width=True)

    with st.spinner("Analyzing..."):
        result = predict(img)

    st.subheader(f"Prediction: {result.replace('_',' ').title()}")

    if result == "high_severity":
        st.error("""
🚨 HIGH SEVERITY

👉 Do NOT panic  
👉 Go to hospital immediately  
👉 Call 108  
👉 Time is critical
""")

    elif result == "moderate_severity":
        st.warning("""
⚠️ MODERATE SEVERITY

👉 Stay calm  
👉 Visit doctor soon  
👉 Monitor condition
""")

    else:
        st.success("""
✅ LOW SEVERITY

👉 No need to panic  
👉 Apply first aid  
👉 Keep area clean
""")