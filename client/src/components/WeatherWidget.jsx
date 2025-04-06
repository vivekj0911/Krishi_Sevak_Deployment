"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun, Wind } from "react-feather"
import { weatherService } from "../services/weatherService"

const WeatherWidget = () => {
  const [showForecast, setShowForecast] = useState(false)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        // Use navigator.geolocation to get user's location
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

          // Fetch current weather
          const weatherData = await weatherService.getCurrentWeather(latitude, longitude, apiKey);
          setCurrentWeather({
            temperature: Math.round(weatherData.main.temp),
            condition: weatherService.mapCondition(weatherData.weather[0]),
            rainChance: Math.round(weatherData.clouds.all), // Using clouds as proxy for rain chance
            windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
            humidity: weatherData.main.humidity,
            city: weatherData.name 
          });

          // Fetch forecast
          const forecastData = await weatherService.getForecast(latitude, longitude, apiKey);
          const dailyForecasts = forecastData.list
            .filter((item, index) => index % 8 === 0) // Get one reading per day
            .slice(0, 7) // Get 7 days
            .map(item => ({
              day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
              temp: Math.round(item.main.temp),
              condition: weatherService.mapCondition(item.weather[0])
            }));
          setForecast(dailyForecasts);
          setLoading(false);
        }, (err) => {
          setError("Please enable location services to get weather information");
          setLoading(false);
        });
      } catch (err) {
        setError("Failed to fetch weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
        return <Sun className="text-yellow-500" size={24} />
      case "partly cloudy":
        return <Cloud className="text-gray-400" size={24} />
      case "cloudy":
        return <Cloud className="text-gray-500" size={24} />
      case "rainy":
        return <CloudRain className="text-blue-400" size={24} />
      case "windy":
        return <Wind className="text-green-400" size={24} />
      default:
        return <Cloud className="text-gray-400" size={24} />
    }
  }
  

  const toggleForecast = () => {
    setShowForecast(!showForecast)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p>Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">Today's Weather</h3>
          <span className="text-sm text-gray-500">{currentWeather?.city || "Your Location"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {getWeatherIcon(currentWeather?.condition)}
            <div className="ml-3">
              <div className="text-3xl font-bold text-gray-800">{currentWeather?.temperature}°C</div>
              <div className="text-gray-600">{currentWeather?.condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center">
              <CloudRain size={16} className="text-blue-500 mr-2" />
              <span className="text-sm text-gray-600">{currentWeather?.rainChance}%</span>
            </div>
            <div className="flex items-center">
              <Wind size={16} className="text-gray-500 mr-2" />
              <span className="text-sm text-gray-600">{currentWeather?.windSpeed} km/h</span>
            </div>
          </div>
        </div>
        {/* Smart Watering Recommendation */}
        {forecast.length > 1 && (
          <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mt-4">
            <h3 className="font-bold text-green-800 text-sm">Smart Watering Recommendation</h3>
            <p className="text-green-700 mt-1">
              {forecast[1].rainChance > 60
                ? "Rain is expected tomorrow. Reduce watering to avoid overwatering."
                : forecast[1].high > 35
                  ? "Hot weather expected. Increase watering to keep plants hydrated."
                  : forecast[1].humidity < 30
                    ? "Low humidity tomorrow. Consider increasing watering slightly."
                    : "Weather conditions are normal. Maintain regular watering schedule."
              }
            </p>
          </div>
        )}
      </div>

      {showForecast && forecast.length > 0 && (
        <div className="bg-green-50 p-4 overflow-x-auto">
          <div className="flex space-x-4 min-w-max">
            {forecast.map((day) => (
              <div key={day.day} className="flex flex-col items-center">
                <span className="text-sm font-medium text-gray-700">{day.day}</span>
                <div className="my-2">{getWeatherIcon(day.condition)}</div>
                <span className="text-sm font-bold text-gray-800">{day.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WeatherWidget
