"use client"

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"
import LanguageSelector from "../components/LanguageSelector";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Basic validation
    if (!formData.phone || !formData.password) {
      setError("Please fill in all fields")
      return
    }

    // Mock login - in a real app, this would call an API
    try {
      // For demo purposes, we'll just set a mock user
      const userData = {
        name: "Demo Farmer",
        phone: formData.phone,
        language: "en",
      }

      login(userData)
      navigate("/home")
    } catch (err) {
      setError("Invalid credentials. Please try again.")
    }
  }

  const defaultTexts = {
    title: "Welcome Back",
    phoneLabel: "Phone Number",
    passwordLabel: "Password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    loginButton: "Login",
    noAccount: "Don't have an account?",
    signup: "Sign up",
  };

  const [translatedText, setTranslatedText] = useState(defaultTexts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex flex-col">
      <header className="p-4 flex justify-between items-center">
        <Link to="/" className="text-green-700 font-bold text-xl">SmartFarm</Link>
        <LanguageSelector
          textKeys={Object.keys(defaultTexts).map((key) => ({ key, value: defaultTexts[key] }))}
          setTranslatedText={setTranslatedText}
        />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">{translatedText.title}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.phoneLabel}</label>
              <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter phone number" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.passwordLabel}</label>
              <input type="password" id="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter password" />
            </div>

            <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
              {translatedText.loginButton}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p>{translatedText.noAccount} <Link to="/signup" className="text-green-600 font-medium">{translatedText.signup}</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;