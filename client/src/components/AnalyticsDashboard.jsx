import { BarChart2, Droplet, TrendingUp } from "react-feather";

const AnalyticsDashboard = () => {
  // Mock data - later replace this with your API call like a boss
  const analyticsData = {
    soilMoisture: {
      current: 32, // 32% soil moisture
      previous: 40, // last month's moisture
      status: "decreasing", // "increasing" or "decreasing"
    },
    cropHealth: {
      status: "healthy",
      riskAreas: 1,
      totalAreas: 5,
    },
    marketPrices: {
      trend: "up",
      percentage: 5.2,
      crop: "Wheat",
    },
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Soil Moisture Prediction */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Soil Moisture</h3>
          <Droplet size={18} className="text-blue-500" />
        </div>

        <div className="flex items-end space-x-1 mb-2">
          <div className="text-2xl font-bold text-gray-800">{analyticsData.soilMoisture.current}%</div>
          <div
            className={`text-sm ${
              analyticsData.soilMoisture.status === "decreasing" ? "text-red-500" : "text-green-500"
            }`}
          >
            {analyticsData.soilMoisture.status === "decreasing" ? "↓" : "↑"}
            {Math.abs(analyticsData.soilMoisture.current - analyticsData.soilMoisture.previous)}%
          </div>
        </div>

        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full"
            style={{ width: `${analyticsData.soilMoisture.current}%` }}
          ></div>
        </div>

        <p className="mt-2 text-xs text-gray-500">Soil moisture level compared to last month</p>
      </div>

      {/* Crop Health and Market Prices (same as before) */}
      {/* Crop Health */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Crop Health</h3>
          <BarChart2 size={18} className="text-green-500" />
        </div>

        <div className="flex items-center mb-3">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              analyticsData.cropHealth.status === "healthy" ? "bg-green-500" : "bg-red-500"
            }`}
          ></div>
          <div className="text-sm text-gray-700">
            {analyticsData.cropHealth.status === "healthy" ? "Healthy" : "At Risk"}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          {analyticsData.cropHealth.riskAreas} out of {analyticsData.cropHealth.totalAreas} areas at risk
        </p>
      </div>

      {/* Market Prices */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-800">Market Prices</h3>
          <TrendingUp size={18} className="text-yellow-500" />
        </div>

        <div className="flex items-end mb-3">
          <div className="text-2xl font-bold text-gray-800">{analyticsData.marketPrices.percentage}%</div>
          <div
            className={`text-sm ml-1 ${
              analyticsData.marketPrices.trend === "up" ? "text-green-500" : "text-red-500"
            }`}
          >
            {analyticsData.marketPrices.trend === "up" ? "↑" : "↓"}
          </div>
        </div>

        <p className="text-xs text-gray-500">Price trend for {analyticsData.marketPrices.crop}</p>
      </div>
    </div>
  )
}

export default AnalyticsDashboard;
