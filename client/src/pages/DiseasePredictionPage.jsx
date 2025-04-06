"use client"

import { useState } from "react"
import TopBar from "../components/TopBar"
import BottomNav from "../components/BottomNav"
import { Camera, Upload, AlertTriangle, Check, Info } from "react-feather"
import Chatbot from "../components/Chatbot/Chatbot"

const DiseasePredictionPage = () => {
  const [activeTab, setActiveTab] = useState("scan")
  const [scanResult, setScanResult] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  const staticPredictions = [
    {
      crop: "Wheat",
      result: "Healthy",
      confidence: 95,
      status: "healthy",
      recommendations: ["No action needed. Maintain regular care."],
    },
    {
      crop: "Tomato",
      result: "Early Blight",
      confidence: 87,
      status: "diseased",
      recommendations: ["Apply copper-based fungicide and remove affected leaves."],
    },
    {
      crop: "Rice",
      result: "Bacterial Leaf Blight",
      confidence: 92,
      status: "diseased",
      recommendations: ["Use bactericides and ensure proper field drainage."],
    },
  ]

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setScanResult(null)
    }
  }

  const givePrediction = async () => {
    if (!selectedFile) {
      alert("Please upload an image first.")
      return
    }

    try {
      // Simulate API call to ML model
      const response = await fetch("/api/predict", {
        method: "POST",
        body: selectedFile,
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch prediction")
      }

      const data = await response.json()
      setScanResult(data)
    } catch (error) {
      console.error("Error fetching ML prediction:", error)
      // Fallback to static prediction
      const randomPrediction =
        staticPredictions[Math.floor(Math.random() * staticPredictions.length)]
      setScanResult(randomPrediction)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <TopBar title="Disease Prediction" />

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b">
            {["scan", "history", "library"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center font-medium ${
                  activeTab === tab
                    ? "text-green-600 border-b-2 border-green-600"
                    : "text-gray-500"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-4">
            {activeTab === "scan" && (
              <div>
                {!scanResult ? (
                  <div className="text-center py-6">
                    <p className="text-gray-600 mb-6">
                      Take a photo or upload an image of your crop to identify diseases
                    </p>

                    {selectedFile && (
                      <div className="text-center mb-4">
                        <p className="text-sm text-gray-600 mb-2">Selected Image:</p>
                        <img
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          className="mx-auto max-h-48 rounded-md shadow"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={givePrediction}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Predict Disease
                      </button>

                      <label className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">
                        <Upload size={20} />
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg">Scan Results</h3>
                      <button
                        onClick={() => {
                          setScanResult(null)
                          setSelectedFile(null)
                        }}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        New Scan
                      </button>
                    </div>

                    <div className="bg-gray-100 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        {scanResult.status === "healthy" ? (
                          <Check size={20} className="text-green-500 mr-2" />
                        ) : (
                          <AlertTriangle size={20} className="text-red-500 mr-2" />
                        )}
                        <h4 className="font-bold text-lg">
                          {scanResult.crop}: {scanResult.result}
                        </h4>
                      </div>

                      <div className="flex items-center mb-4">
                        <div className="text-sm text-gray-600 mr-2">Confidence:</div>
                        <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              scanResult.status === "healthy" ? "bg-green-500" : "bg-red-500"
                            }`}
                            style={{ width: `${scanResult.confidence}%` }}
                          ></div>
                        </div>
                        <div className="ml-2 text-sm font-medium">{scanResult.confidence}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default DiseasePredictionPage
