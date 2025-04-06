"use client"

import { createContext, useState, useContext, useEffect } from "react"

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const user = localStorage.getItem("user")
    if (user) {
      setCurrentUser(JSON.parse(user))
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    // In a real app, you would validate credentials with an API
    setCurrentUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    return true
  }

  const signup = (userData) => {
    // In a real app, you would send this data to an API
    setCurrentUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("user")
  }

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}

