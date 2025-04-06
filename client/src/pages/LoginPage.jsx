"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LanguageSelector from "../components/LanguageSelector";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    if (!formData.phone || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
  
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
  
      login(data.user);
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };
  

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

          {error && <p className="text-red-600 text-center mb-4">{error}</p>}

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
