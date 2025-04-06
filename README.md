# TechnoSapiensDevClash

# 🌾 Krushi Sevak - Smart Agriculture Platform

A comprehensive smart agriculture solution to empower farmers at every stage of their journey — from selecting the right crop to harvesting — using AI, weather analytics, farm insights, and real-time chatbot support.

---


## 🚀 Features

### 🌟 Core Features Implemented

- ✅ **24/7 Chatbot Support** — For real-time query resolution and farming guidance.
- 🌦️ **Real-time Weather Analytics** — Up-to-date weather data, integrated with open APIs.
- 📊 **Farm Analytics Dashboard** — Insights on soil, field health, moisture, and irrigation logs.
- 📰 **News and Feed Section** — Stay updated with agri-news, policy updates, and market trends.
- 🗓️ **Farming Calendar** — Helps plan activities based on the crop lifecycle.
- 🔎 **Detailed Weather Forecast** — Daily & weekly forecasts with rainfall, humidity, and temperature.
- 🧠 **AI-Based Disease Prediction** — Upload leaf images to detect diseases using deep learning.
- 🔐 **Authentication System** — Signup/login with secure route protection (JWT based).
- 🌐 **Multilingual Translation** — Language selector for better accessibility.
- 📍 **Field Mapping** — Interactive field management with map previews.
- 📅 **Irrigation Logging** — Log and track water usage in your farm field.
- 👤 **Profile Page** — User-specific profile with field, weather, and analytics history.
- ✅ **Responsive UI** — Built using TailwindCSS and Vite for blazing fast performance.

---

## 🧠 Machine Learning Models

### 1. **🌿 Plant Disease Detection (94% Accuracy)**

- **Model Used:** ResNet50 (Transfer Learning)
- **Dataset:** Over 80,000 images of plants, categorized into 38 classes of plant diseases.
- **Methodology:**
  - Used pre-trained ResNet50 model.
  - Fine-tuned using advanced augmentation techniques.
  - Achieved a training accuracy of 94%.
- **Use Case:** Farmers upload leaf images to detect disease and get instant remedies.

### 2. **💧 Groundwater Prediction (91% Accuracy)**

- **Model Used:** LSTM VAE (Variational Autoencoder)
- **Methodology:**
  - Historical groundwater level data fed into LSTM layers.
  - Autoencoder architecture ensures dimensionality reduction and sequence learning.
  - Achieved 91% prediction accuracy.
- **Use Case:** Helps in planning irrigation schedules and water resource management.

---
## 🛠️ Setup Instructions

### 📦 Prerequisites

- Node.js v18+
- Python 3.8+
- MongoDB (Local or Atlas)
- Vite (used for frontend build)
- Pip + virtualenv

---

### ⚙️ How to Run the Project

## 🔧 Technologies Used

### 🌐 Frontend
- **React.js** with Vite
- **TailwindCSS**
- **React Router**
- **Context API**
- **Axios**


### 🧠 Backend
- **Node.js**, **Express.js**
- **MongoDB** (Mongoose ODM)
- **REST API Design**

### 🌤 Weather & Chatbot
- Integrated using **external APIs**
- Custom chatbot engine in `chatbotServices.js`

### 🧪 AI/ML Disease Detection
- Trained CNN Model in `best_model.pth`
- Served using `app.py` with FastAPI/Flask

---

## 📦 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/tanmaykulkarni2112/technosapiensdevclash.git
cd tanmaykulkarni2112-technosapiensdevclash
```
### 2.Install Frontend Dependencies
```bash
cd client
npm install
```

### 3.Install Backend Dependencies
```bash
cd ../server
npm install
```

### 4.Start Frontend
```bash
cd ../client
npm run dev
```

### 5.Start Backend
```bash
cd ../server
node server.js
```

### 6.Run ML Server 
```bash
cd ../ML_Training_jupyter_files
python app.py
```
