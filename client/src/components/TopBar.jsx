"use client"

import { useState } from "react"
import { Bell, Menu, X } from "react-feather"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import LanguageSelector from "./LanguageSelector"

const TopBar = ({ title, textKeys, setTranslatedText }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { currentUser, logout } = useAuth()

  

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
    if (notificationsOpen) setNotificationsOpen(false)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
    if (menuOpen) setMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
  }

  // Mock notifications
  const notifications = [
    { id: 1, message: "Weather alert: Rain expected tomorrow", time: "2 hours ago" },
    { id: 2, message: "Crop health: Potential issue detected in Field 2", time: "Yesterday" },
    { id: 3, message: "Market update: Wheat prices increased by 5%", time: "2 days ago" },
  ]

  return (
    <div className="relative ">
      <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center shadow-md">
        <button onClick={toggleMenu} className="p-2 rounded-full hover:bg-green-700 transition-colors duration-200">
          <Menu size={24} />
        </button>

        <h1 className="text-xl font-bold">{title || "SmartFarm"}</h1>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-green-700 transition-colors duration-200 relative"
          >
            <Bell size={24} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications.length}
            </span>
          </button>

          <LanguageSelector textKeys={textKeys} setTranslatedText={setTranslatedText} />

        </div>
      </div>

      {/* Sidebar Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="bg-black opacity-10 flex-1" onClick={toggleMenu}></div>
          <div className="bg-white w-64 shadow-lg flex flex-col h-full absolute left-0">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="font-bold text-xl text-green-700">Menu</h2>
              <button onClick={toggleMenu} className="p-1">
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="p-4 border-b bg-green-50">
              <p className="text-sm text-gray-600">Welcome</p>
              <p className="font-medium text-gray-800">{currentUser?.name || "Farmer"}</p>
              <p className="text-sm text-gray-600">{currentUser?.phone || ""}</p>
            </div>

            <nav className="flex-1 overflow-y-auto">
              <ul className="py-2">
                <li>
                  <Link
                    to="/home"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/weather"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Weather</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/disease-prediction"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Disease Prediction</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Profile</span>
                  </Link>
                </li>
                <li className="border-t mt-2">
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Settings</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/help"
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50"
                    onClick={toggleMenu}
                  >
                    <span>Help & Support</span>
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {notificationsOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium">Notifications</h3>
            <button onClick={toggleNotifications}>
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div>
            {notifications.length > 0 ? (
              <ul>
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-gray-100 last:border-b-0">
                    <a href="#" className="block p-4 hover:bg-gray-50">
                      <p className="text-sm text-gray-800">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No new notifications</div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200">
            <button className="w-full text-center text-sm text-green-600 p-2 hover:bg-green-50 rounded">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TopBar

