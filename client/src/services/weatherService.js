const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const weatherService = {
  // Get current weather
  async getCurrentWeather(lat, lon, apiKey) {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    ); 
    
    if (!response.ok) throw new Error('Failed to fetch current weather');
    return response.json();
  },

  // Get weather forecast
  async getForecast(lat, lon, apiKey) {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    if (!response.ok) throw new Error('Failed to fetch forecast');
    return response.json();
  },

  // Helper to map OpenWeather conditions to our app's conditions
  mapCondition(owmCondition) {
    const code = owmCondition?.id;
    if (!code) return 'Sunny';

    if (code >= 200 && code < 300) return 'Rain'; // Thunderstorm
    if (code >= 300 && code < 400) return 'Rain'; // Drizzle
    if (code >= 500 && code < 600) return 'Rain'; // Rain
    if (code >= 600 && code < 700) return 'Cloudy'; // Snow
    if (code >= 700 && code < 800) return 'Cloudy'; // Atmosphere
    if (code === 800) return 'Sunny'; // Clear
    if (code > 800) return 'Partly Cloudy'; // Clouds

    return 'Sunny';
  }
};
