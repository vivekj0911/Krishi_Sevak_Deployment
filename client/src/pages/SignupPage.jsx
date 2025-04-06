import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import axios from "axios";

const SignUpPage = () => {

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email:"",
    location: "",
    password: "",
    confirmPassword: "",
    language: "en",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate()

  

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.location || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    const requestData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
    };

    console.log("Sending Request:", requestData); // Log outgoing request

    try {
        const response = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
        });

        const data = await response.json();
        console.log("Response Data:", data); // Log server response

        if (!response.ok) {
            throw new Error(data.message || "Signup failed");
        }

        navigate("/home");
    } catch (err) {
        setError(err.message);
    }
};


  const defaultTexts = {
    title: "Create an Account",
    nameLabel: "Full Name",
    emailLabel: "Email Address",
    phoneLabel: "Phone Number",
    locationLabel: "Location",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    signupButton: "Sign Up",
    haveAccount: "Already have an account?",
    login: "Login",
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
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.nameLabel}</label>
              <input id="name" name="name"  type="text" required value={formData.name} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter full name" />
            </div>
            
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.emailLabel}</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter email" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.phoneLabel}</label>
              <input id="phone" name="phone" type="tel" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter phone number" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.locationLabel}</label>
              <input id="location" name="location" type="text" required value={formData.location} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter your location" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.passwordLabel}</label>
              <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Enter password" />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">{translatedText.confirmPasswordLabel}</label>
              <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" placeholder="Confirm password" />
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg">
              {translatedText.signupButton}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p>{translatedText.haveAccount} <Link to="/login" className="text-green-600 font-medium">{translatedText.login}</Link></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
