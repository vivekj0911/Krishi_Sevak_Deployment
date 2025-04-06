"use client"

import { useState } from "react"
import { X, MessageCircle } from "react-feather"

const TipOfTheDay = () => {
  const [dismissed, setDismissed] = useState(false)

  // Mock tips - in a real app, these would rotate daily
  const tips = [
    "Water your crops early in the morning to reduce evaporation and fungal growth.",
    "Crop rotation helps prevent soil depletion and reduces pest problems.",
    "Mulching conserves water and suppresses weeds around your plants.",
    "Monitor soil moisture regularly to avoid over or under-watering.",
    "Integrated pest management reduces the need for chemical pesticides.",
  ]

  // Randomly select a tip
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  if (dismissed) {
    return null
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 relative">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        <X size={16} />
      </button>

      <div className="flex">
        <MessageCircle className="text-green-600 mr-3 flex-shrink-0 mt-1" size={20} />
        <div>
          <h3 className="font-bold text-green-800 text-sm">Tip of the Day</h3>
          <p className="text-green-700 mt-1">{randomTip}</p>
        </div>
      </div>
    </div>
  )
}

export default TipOfTheDay

