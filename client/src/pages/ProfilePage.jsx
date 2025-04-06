"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import TopBar from "../components/TopBar"
import BottomNav from "../components/BottomNav"
import { MapPin, User, ChevronRight, Calendar, Droplet, Activity, AlertTriangle, Check } from "react-feather"
import profileImg from "../assets/image.png"

const ProfilePage = () => {
  const { currentUser } = useAuth()
  const [activeSection, setActiveSection] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState(null)

  // Mock user data - in a real app, this would come from an API
  const userData = {
    name: currentUser?.name || "Demo Farmer",
    phone: currentUser?.phone || "123-456-7890",
    location: {
      village: "Green Village",
      district: "Farmland District",
      state: "Agricultural State",
    },
    landSize: "5 hectares",
    farmingType: "Mixed (Crop & Livestock)",
    profilePhoto: "/images/farmer-profile.jpg",
  }

  // Mock crops data
  const cropsData = [
    {
      id: 1,
      name: "Wheat",
      icon: "🌾",
      plantedDate: "2023-01-15",
      harvestDate: "2023-05-20",
      progress: 75,
      status: "Healthy",
      statusColor: "green",
      yield: {
        expected: "2.5 tons/hectare",
        previous: "2.2 tons/hectare",
        trend: "up",
      },
      soil: {
        type: "Loamy",
        ph: 6.8,
        nutrients: {
          nitrogen: "Good",
          phosphorus: "Need Work",
          potassium: "Good",
        },
      },
      recommendations: [
        "Apply phosphorus-rich fertilizer",
        "Monitor for rust disease",
        "Prepare for harvesting in 3 weeks",
      ],
      nextCropSuggestions: ["Soybean", "Maize", "Chickpea"],
    },
    {
      id: 2,
      name: "Rice",
      icon: "🌾",
      plantedDate: "2023-02-10",
      harvestDate: "2023-06-15",
      progress: 60,
      status: "Water",
      statusColor: "amber",
      yield: {
        expected: "3.8 tons/hectare",
        previous: "3.5 tons/hectare",
        trend: "up",
      },
      soil: {
        type: "Clayey",
        ph: 5.9,
        nutrients: {
          nitrogen: "Good",
          phosphorus: "Good",
          potassium: "Needs Work",
        },
      },
      recommendations: ["Irrigate within 2 days", "Apply potassium supplement", "Check for pest infestation"],
      nextCropSuggestions: ["Lentil", "Mustard", "Vegetables"],
    },
    {
      id: 3,
      name: "Tomato",
      icon: "🍅",
      plantedDate: "2023-03-05",
      harvestDate: "2023-05-25",
      progress: 85,
      status: "Harvest",
      statusColor: "green",
      yield: {
        expected: "25 tons/hectare",
        previous: "22 tons/hectare",
        trend: "up",
      },
      soil: {
        type: "Sandy Loam",
        ph: 6.2,
        nutrients: {
          nitrogen: "Good",
          phosphorus: "Good",
          potassium: "Good",
        },
      },
      recommendations: ["Begin harvesting ripe tomatoes", "Continue regular watering", "Monitor for late blight"],
      nextCropSuggestions: ["Cucumber", "Beans", "Okra"],
    },
    {
      id: 4,
      name: "Corn",
      icon: "🌽",
      plantedDate: "2023-03-20",
      harvestDate: "2023-07-10",
      progress: 40,
      status: "Growing",
      statusColor: "green",
      yield: {
        expected: "4.5 tons/hectare",
        previous: "4.2 tons/hectare",
        trend: "up",
      },
      soil: {
        type: "Loamy",
        ph: 6.5,
        nutrients: {
          nitrogen: "Need Work",
          phosphorus: "Good",
          potassium: "Good",
        },
      },
      recommendations: ["Apply nitrogen-rich fertilizer", "Thin plants if overcrowded", "Monitor for corn borer"],
      nextCropSuggestions: ["Wheat", "Soybean", "Sunflower"],
    },
  ]

  const toggleSection = (section) => {
    if (activeSection === section) {
      setActiveSection(null)
    } else {
      setActiveSection(section)
    }
  }

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop)
  }

  const handleBackToCrops = () => {
    setSelectedCrop(null)
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "healthy":
      case "harvest":
        return <Check className="text-green-500" />
      case "need water":
        return <Droplet className="text-amber-500" />
      case "growing":
        return <Activity className="text-blue-500" />
      default:
        return <AlertTriangle className="text-red-500" />
    }
  }

  const getStatusColor = (color) => {
    switch (color) {
      case "green":
        return "bg-green-100 text-green-800"
      case "amber":
        return "bg-amber-100 text-amber-800"
      case "red":
        return "bg-red-100 text-red-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  const calculateDaysLeft = (harvestDate) => {
    const today = new Date()
    const harvest = new Date(harvestDate)
    const diffTime = Math.abs(harvest - today)
    const diffDays = Math.ceil(diffTime / (10000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <TopBar title="Profile" />

      <main className="container mx-auto px-4 py-6">
        {!selectedCrop ? (
          <>
            {/* Farmer Basic Info Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="p-4 flex items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                  {userData.profilePhoto ? (
                    <img
                    src={userData.profilePhoto || profileImg}
                    alt={userData.name || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = profileImg)}
                  />
                  
                  ) : (
                    <User size={32} className="text-green-600" />
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800">{userData.name}</h2>
                  <p className="text-gray-600">{userData.phone}</p>
                </div>
              </div>

              <div
                className="p-4 border-t border-gray-100 flex justify-between items-center cursor-pointer"
                onClick={() => toggleSection("farmerDetails")}
              >
                <div className="font-medium">Farmer Details</div>
                <ChevronRight
                  size={20}
                  className={`text-gray-400 transition-transform ${
                    activeSection === "farmerDetails" ? "rotate-90" : ""
                  }`}
                />
              </div>

              {activeSection === "farmerDetails" && (
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-3">
                    <div className="flex">
                      <div className="w-1/3 text-gray-600">Location:</div>
                      <div className="w-2/3 font-medium">
                        <div className="flex items-center">
                          <MapPin size={16} className="text-green-600 mr-1" />
                          {userData.location.village}, {userData.location.district}, {userData.location.state}
                        </div>
                      </div>
                    </div>

                    <div className="flex">
                      <div className="w-1/3 text-gray-600">Land Size:</div>
                      <div className="w-2/3 font-medium">{userData.landSize}</div>
                    </div>

                    <div className="flex">
                      <div className="w-1/3 text-gray-600">Farming Type:</div>
                      <div className="w-2/3 font-medium">{userData.farmingType}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Crop List Section */}
            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">Your Crops</h3>

              <div className="grid grid-cols-2 gap-3">
                {cropsData.map((crop) => (
                  <div
                    key={crop.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCropSelect(crop)}
                  >
                    <div className="p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl mr-2">{crop.icon}</span>
                        <h4 className="font-medium">{crop.name}</h4>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className={`px-2 py-1 rounded-full ${getStatusColor(crop.statusColor)}`}>
                          {crop.status}
                        </div>

                        <div className="flex items-center">
                          <Calendar size={14} className="text-gray-500 mr-1" />
                          <span>{calculateDaysLeft(crop.harvestDate)} days</span>
                        </div>
                      </div>

                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${crop.progress}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Crop Details View */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 bg-green-50 border-b border-green-100 flex items-center">
              <button onClick={handleBackToCrops} className="mr-3 p-1 hover:bg-green-100 rounded-full">
                <ChevronRight size={20} className="text-green-600 transform rotate-180" />
              </button>

              <div className="flex items-center">
                <span className="text-3xl mr-2">{selectedCrop.icon}</span>
                <h3 className="text-xl font-bold text-gray-800">{selectedCrop.name}</h3>
              </div>
            </div>

            <div className="p-4">
              {/* Harvesting Time */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-700">Time to Harvest</h4>
                  <div className="text-sm text-gray-600">{calculateDaysLeft(selectedCrop.harvestDate)} days left</div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${selectedCrop.progress}%` }}></div>
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <div>Planted: {new Date(selectedCrop.plantedDate).toLocaleDateString()}</div>
                  <div>Harvest: {new Date(selectedCrop.harvestDate).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Current Status */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Current Status</h4>
                <div className={`flex items-center p-3 rounded-lg ${getStatusColor(selectedCrop.statusColor)}`}>
                  {getStatusIcon(selectedCrop.status)}
                  <span className="ml-2 font-medium">{selectedCrop.status}</span>
                </div>
              </div>

              {/* Yield Information */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Expected Yield</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold">{selectedCrop.yield.expected}</div>
                      <div className="text-sm text-gray-500">Previous: {selectedCrop.yield.previous}</div>
                    </div>

                    <div className={`text-sm ${selectedCrop.yield.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {selectedCrop.yield.trend === "up" ? "↑" : "↓"}
                      {selectedCrop.yield.trend === "up" ? "Increase" : "Decrease"} from last season
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Information */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Soil Information</h4>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex mb-2">
                    <div className="w-1/3 text-gray-600">Type:</div>
                    <div className="w-2/3 font-medium">{selectedCrop.soil.type}</div>
                  </div>

                  <div className="flex mb-2">
                    <div className="w-1/3 text-gray-600">pH Level:</div>
                    <div className="w-2/3 font-medium">{selectedCrop.soil.ph}</div>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="text-gray-600 mb-2">Nutrients:</div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Nitrogen</div>
                        <div
                          className={`mt-1 text-sm font-medium ${
                            selectedCrop.soil.nutrients.nitrogen === "Good" ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {selectedCrop.soil.nutrients.nitrogen}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-gray-500">Phosphorus</div>
                        <div
                          className={`mt-1 text-sm font-medium ${
                            selectedCrop.soil.nutrients.phosphorus === "Good" ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {selectedCrop.soil.nutrients.phosphorus}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-xs text-gray-500">Potassium</div>
                        <div
                          className={`mt-1 text-sm font-medium ${
                            selectedCrop.soil.nutrients.potassium === "Good" ? "text-green-600" : "text-amber-600"
                          }`}
                        >
                          {selectedCrop.soil.nutrients.potassium}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
                <div className="bg-green-50 p-3 rounded-lg">
                  <ul className="space-y-2">
                    {selectedCrop.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="bg-green-200 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                          {index + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full mt-3 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                    Get More Tips
                  </button>
                </div>
              </div>

              {/* Next Crop Suggestions */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Recommended Next Crops</h4>
                <div className="flex overflow-x-auto pb-2 -mx-1">
                  {selectedCrop.nextCropSuggestions.map((crop, index) => (
                    <div key={index} className="px-1">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 min-w-[120px] text-center">
                        <div className="text-lg mb-1">
                          {crop === "Soybean"
                            ? "🫘"
                            : crop === "Maize"
                              ? "🌽"
                              : crop === "Chickpea"
                                ? "🌱"
                                : crop === "Lentil"
                                  ? "🌱"
                                  : crop === "Mustard"
                                    ? "🌱"
                                    : crop === "Vegetables"
                                      ? "🥬"
                                      : crop === "Cucumber"
                                        ? "🥒"
                                        : crop === "Beans"
                                          ? "🫘"
                                          : crop === "Okra"
                                            ? "🌱"
                                            : crop === "Wheat"
                                              ? "🌾"
                                              : crop === "Sunflower"
                                                ? "🌻"
                                                : "🌱"}
                        </div>
                        <div className="font-medium">{crop}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default ProfilePage