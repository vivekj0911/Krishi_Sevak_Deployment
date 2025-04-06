"use client"

import { useAuth } from "../context/AuthContext"
import TopBar from "../components/TopBar"
import BottomNav from "../components/BottomNav"
import WeatherWidget from "../components/WeatherWidget"
import AnalyticsDashboard from "../components/AnalyticsDashboard"
import TipOfTheDay from "../components/TipOfTheDay"
import NewsSection from "../components/NewsSection"
import GreenCalendar from "../components/GreenCalendar"

const HomePage = () => {
  const { currentUser } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <TopBar title="Home" />

      <main className="container mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Hello, Farmer {currentUser?.name?.split(" ")[0] || "Friend"} 👋
          </h2>
          <p className="text-gray-600">Here's your farm overview for today</p>
        </div>

        {/* Weather Widget */}
        <div className="mb-6">
          <WeatherWidget />
        </div>

        {/* Analytics Dashboard */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Farm Analytics</h3>
          <AnalyticsDashboard />
        </div>

        {/* News Section */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Agricultural News</h3>
          <NewsSection />
        </div>

        {/* Farming Calendar */}
        <div className="mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Farming Calendar</h3>
          <GreenCalendar />
        </div>

        {/* Tip of the Day */}
        <div className="mb-6">
          <TipOfTheDay />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default HomePage

