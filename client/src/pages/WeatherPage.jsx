"use client"

import { useEffect, useState } from "react"

import { AlertTriangle, ArrowDown, ArrowUp, BarChart2, Cloud, CloudRain, Droplet, Layers, Navigation, Sun, Thermometer, Wind } from "react-feather"

import BottomNav from "../components/BottomNav"
import Chatbot from "../components/Chatbot/Chatbot"
import TopBar from "../components/TopBar"
import { weatherService } from "../services/weatherService"

const WeatherPage = () => {
  const [activeTab, setActiveTab] = useState("forecast")
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [hourlyForecast, setHourlyForecast] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [location, setLocation] = useState("Your Farm")
  const [groundWaterData, setGroundWaterData] = useState({
    currentLevel: 62,
    previousWeek: 68,
    previousMonth: 73,
    prediction: 58,
    annualAverage: 65,
    soilMoisture: 38
  })

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

          // Fetch current weather
          const weatherData = await weatherService.getCurrentWeather(latitude, longitude, apiKey);
          
          // Extract location from weather data if available 
          if (weatherData.name) {
            setLocation(weatherData.name);
          }
          
          setCurrentWeather({
            temperature: Math.round(weatherData.main.temp),
            feelsLike: Math.round(weatherData.main.feels_like),
            condition: weatherService.mapCondition(weatherData.weather[0]),
            rainChance: Math.round(weatherData.clouds.all),
            windSpeed: Math.round(weatherData.wind.speed * 3.6),
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            visibility: Math.round(weatherData.visibility / 1000),
            uvIndex: 0, // OpenWeather doesn't provide UV index in basic API
            windDirection: weatherData.wind.deg
          });

          // Fetch forecast
          const forecastData = await weatherService.getForecast(latitude, longitude, apiKey);

          // Process daily forecast
          const dailyForecasts = forecastData.list
            .filter((item, index) => index % 8 === 0) // Get one reading per day
            .slice(0, 7) // Get 7 days
            .map(item => ({
              day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
              date: new Date(item.dt * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              high: Math.round(item.main.temp_max),
              low: Math.round(item.main.temp_min),
              condition: weatherService.mapCondition(item.weather[0]),
              rainChance: Math.round(item.clouds.all),
              windSpeed: Math.round(item.wind.speed * 3.6),
              humidity: item.main.humidity
            }));
          setForecast(dailyForecasts);

          // Process hourly forecast (next 24 hours)
          const hourlyForecasts = forecastData.list
            .slice(0, 8) // Get next 24 hours (3-hour intervals)
            .map(item => ({
              time: new Date(item.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric' }),
              temp: Math.round(item.main.temp),
              condition: weatherService.mapCondition(item.weather[0]),
              rainChance: Math.round(item.clouds.all)
            }));
          setHourlyForecast(hourlyForecasts);

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

  const getWeatherIcon = (condition, size = 12) => {
    switch (condition?.toLowerCase()) {
      case "sunny":
      case "clear":
        return <Sun className="text-yellow-500" size={size} />
      case "partly cloudy":
        return <Cloud className="text-gray-400" size={size} />
      case "cloudy":
        return <Cloud className="text-gray-500" size={size} />
      case "rain":
        return <CloudRain className="text-blue-500" size={size} />
      default:
        return <Sun className="text-yellow-500" size={size} />
    }
  }

  const getWindDirectionIcon = (degrees) => {
    return <Navigation style={{ transform: `rotate(${degrees}deg)` }} size={18} className="text-gray-600" />
  }

  const getFarmingRecommendation = () => {
    if (!currentWeather) return "";
    
    if (currentWeather.rainChance > 70) {
      return "Heavy rain expected. Consider postponing irrigation and outdoor work. Prepare drainage systems.";
    } else if (currentWeather.rainChance > 40) {
      return "Moderate rain possible. Good time for planting, but postpone fertilizer application.";
    } else if (currentWeather.windSpeed > 25) {
      return "Strong winds expected. Secure young plants and postpone spraying activities.";
    } else if (currentWeather.temperature > 30) {
      return "High temperatures expected. Increase irrigation and provide shade for sensitive crops.";
    } else if (currentWeather.temperature < 10) {
      return "Cool temperatures. Monitor frost-sensitive crops and consider protective measures.";
    } else {
      return "Favorable conditions for most farming activities. Good day for field work.";
    }
  }

  const getGroundwaterStatus = () => {
    const current = groundWaterData.currentLevel;
    const avg = groundWaterData.annualAverage;
    
    if (current < avg * 0.8) return { status: "Low", color: "text-red-600" };
    if (current < avg * 0.9) return { status: "Below Average", color: "text-yellow-600" };
    if (current > avg * 1.1) return { status: "Above Average", color: "text-green-600" };
    return { status: "Normal", color: "text-blue-600" };
  }

  const getGroundwaterTrend = () => {
    const trend = ((groundWaterData.currentLevel - groundWaterData.previousWeek) / groundWaterData.previousWeek) * 100;
    return {
      value: trend.toFixed(1),
      icon: trend < 0 ? <ArrowDown className="text-red-500" size={14} /> : <ArrowUp className="text-green-500" size={14} />,
      text: trend < 0 ? "text-red-500" : "text-green-500"
    };
  }

  const getSoilMoistureStatus = () => {
    const moisture = groundWaterData.soilMoisture;
    
    if (moisture < 20) return { status: "Very Dry", color: "text-red-600" };
    if (moisture < 35) return { status: "Dry", color: "text-yellow-600" };
    if (moisture < 60) return { status: "Adequate", color: "text-green-600" };
    return { status: "Wet", color: "text-blue-600" };
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <TopBar title="Weather" />
        <main className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center">
            <div className="text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-gray-200 h-12 w-12"></div>
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-36"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-gray-600">Loading your farm's weather data...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-16">
        <TopBar title="Weather & Water" />
        <main className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <AlertTriangle size={40} className="mx-auto text-yellow-500 mb-4" />
            <p className="text-red-500 font-medium">{error}</p>
            <button 
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const gwStatus = getGroundwaterStatus();
  const gwTrend = getGroundwaterTrend();
  const soilStatus = getSoilMoistureStatus();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <TopBar title="Weather & Water" />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Location */}
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800">{location}</h2>
          <p className="text-sm text-gray-500">Updated just now</p>
        </div>

        {/* Current Weather Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md p-6 text-white">
          <div className="flex justify-between items-start">
            <div class="mr-2">
              <div className="flex items-center">

                {getWeatherIcon(currentWeather?.condition, 30)}
                <div className="ml-4">
                  <div className="text-3xl font-bold">{currentWeather?.temperature}°C</div>

               
                  <div className="text-lg mt-1 opacity-90">
                    {currentWeather?.condition}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm opacity-90">
                Feels like {currentWeather?.feelsLike}°C
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/20 rounded-lg p-2">
                <div className="flex items-center opacity-90">
                  <CloudRain size={16} className="mr-1" />
                  Rain
                </div>
                <div className="font-medium text-lg">{currentWeather?.rainChance}%</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="flex items-center opacity-90">
                  <Wind size={16} className="mr-1" />
                  Wind
                </div>
                <div className="font-medium text-lg flex items-center">
                  {currentWeather?.windSpeed} 
                  <span className="text-xs ml-1">km/h</span>
                  <span className="ml-1">{getWindDirectionIcon(currentWeather?.windDirection)}</span>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="flex items-center opacity-90">
                  <Droplet size={16} className="mr-1" />
                  Humidity
                </div>
                <div className="font-medium text-lg">{currentWeather?.humidity}%</div>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <div className="flex items-center opacity-90">
                  <Thermometer size={16} className="mr-1" />
                  Pressure
                </div>
                <div className="font-medium text-lg flex items-center">
                  {currentWeather?.pressure} 
                  <span className="text-xs ml-1">hPa</span>
                </div>
              </div>
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
        {/* Ground Water Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center">
            <Layers className="text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-blue-800">Ground Water & Soil Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {/* Water Level Card */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Water Table Level</h3>
              <div className="flex items-end space-x-2">


                <div className="text-3xl font-bold text-blue-700">{groundWaterData.currentLevel}</div>

                <div className="text-sm text-gray-500 mb-1">meters</div>
                <div className="flex items-center text-sm ml-2">
                  <span className={gwTrend.text}>{gwTrend.icon} {Math.abs(gwTrend.value)}%</span>
                  <span className="text-gray-500 ml-1">this week</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Status:</span>
                  <span className={`font-medium ${gwStatus.color}`}>{gwStatus.status}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Annual Avg:</span>
                  <span className="font-medium">{groundWaterData.annualAverage}m</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(groundWaterData.currentLevel/groundWaterData.previousMonth)*100}%` }}></div>
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-500">
                  <span>Low</span>
                  <span>Average</span>
                  <span>High</span>
                </div>
              </div>
            </div>
            
            {/* Soil Moisture Card */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">Soil Moisture</h3>
              <div className="flex items-end space-x-2">
                <div className="text-3xl font-bold text-blue-700">{groundWaterData.soilMoisture}%</div>
                <div className="flex items-center text-sm ml-2">
                  <span className={soilStatus.color}>{soilStatus.status}</span>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      groundWaterData.soilMoisture < 20 ? 'bg-red-500' : 
                      groundWaterData.soilMoisture < 35 ? 'bg-yellow-500' : 
                      groundWaterData.soilMoisture < 60 ? 'bg-green-500' : 'bg-blue-500'
                    }`} 
                    style={{ width: `${groundWaterData.soilMoisture}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-red-500">Dry</span>
                  <span className="text-yellow-500">Low</span>
                  <span className="text-green-500">Ideal</span>
                  <span className="text-blue-500">Wet</span>
                </div>
              </div>
              
              <div className="mt-3 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Recommended Action:</span>
                </div>
                <span className="text-gray-700">
                  {groundWaterData.soilMoisture < 20 ? 'Immediate irrigation needed' : 
                   groundWaterData.soilMoisture < 35 ? 'Schedule irrigation soon' : 
                   groundWaterData.soilMoisture < 60 ? 'Soil moisture adequate' : 'Avoid irrigation'}
                </span>
              </div>
            </div>
            
            {/* Water Trends Card */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Ground Water Trends</h3>
                <div className="flex space-x-2">
                  <button className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">This Week</button>
                  <button className="px-2 py-1 text-xs text-gray-500 rounded">This Month</button>
                  <button className="px-2 py-1 text-xs text-gray-500 rounded">This Year</button>
                </div>
              </div>
              
              <div className="flex items-center justify-center h-48 bg-blue-50 rounded-lg p-4">
                <BarChart2 size={48} className="text-blue-300 opacity-50" />
                <p className="text-gray-500 ml-4">Water level analytics visualization would appear here</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">Current Level</p>
                  <p className="font-medium">{groundWaterData.currentLevel}m</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">30-Day Change</p>
                  <p className={groundWaterData.currentLevel < groundWaterData.previousMonth ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                    {((groundWaterData.currentLevel - groundWaterData.previousMonth) / groundWaterData.previousMonth * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forecast (7-Day)</p>
                  <p className="font-medium">{groundWaterData.prediction}m</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("forecast")}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === "forecast" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"
                }`}
            >
              7-Day Forecast
            </button>
            <button
              onClick={() => setActiveTab("hourly")}
              className={`flex-1 py-3 text-sm font-medium ${activeTab === "hourly" ? "text-green-600 border-b-2 border-green-600" : "text-gray-500"
                }`}
            >
              Hourly
            </button>
          </div>

          <div className="p-4">
            {activeTab === "forecast" && (
              <div>
                {forecast.map((day, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between py-3 ${index < forecast.length - 1 ? "border-b border-gray-100" : ""
                      }`}
                  >
                    <div className="flex items-center">
                      <div className="w-28">
                        <div className="font-medium">{day.day}</div>
                        <div className="text-xs text-gray-500">{day.date}</div>
                      </div>
                      <div className="mr-4">{getWeatherIcon(day.condition)}</div>
                      <div className="text-sm flex flex-col">
                        <div className="flex items-center">
                          <CloudRain size={14} className="text-blue-500 mr-1" />
                          <span>{day.rainChance}%</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Wind size={14} className="text-gray-500 mr-1" />
                          <span>{day.windSpeed} km/h</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right">
                        <span className="font-medium flex items-center">
                          <ArrowUp size={14} className="text-red-500 mr-1" />
                          {day.high}°
                        </span>
                        <span className="text-gray-500 flex items-center mt-1">
                          <ArrowDown size={14} className="text-blue-500 mr-1" />
                          {day.low}°
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "hourly" && (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 min-w-max pb-2">
                  {hourlyForecast.map((hour, index) => (
                    <div key={index} className="flex flex-col items-center w-20 p-2 rounded-lg hover:bg-blue-50">
                      <div className="text-sm font-medium">{hour.time}</div>
                      <div className="my-2">{getWeatherIcon(hour.condition)}</div>
                      <div className="text-lg font-bold">{hour.temp}°</div>
                      <div className="flex items-center mt-1">
                        <CloudRain size={12} className="text-blue-500 mr-1" />
                        <span className="text-xs">{hour.rainChance}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Chatbot />
      <BottomNav />
    </div>
  )
}

export default WeatherPage