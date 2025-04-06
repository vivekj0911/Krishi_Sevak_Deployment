import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import ProtectedRoute from "./components/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"
import DiseasePredictionPage from "./pages/DiseasePredictionPage"
import HomePage from "./pages/HomePage"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import ProfilePage from "./pages/ProfilePage"
import SignupPage from "./pages/SignupPage"
import WeatherPage from "./pages/WeatherPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/weather"
            element={
              <ProtectedRoute>
                <WeatherPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disease-prediction"
            element={
              <ProtectedRoute>
                <DiseasePredictionPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

