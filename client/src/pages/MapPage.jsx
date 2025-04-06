"use client"

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, LayersControl, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BottomNav  from '../components/BottomNav';
import  TopBar  from '../components/TopBar';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different sensor types
const createSensorIcon = (type) => {
  const iconMap = {
    'groundwater': L.icon({
      iconUrl: '/icons/water-droplet.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    }),
    'moisture': L.icon({
      iconUrl: '/icons/soil-moisture.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    }),
    'irrigation': L.icon({
      iconUrl: '/icons/irrigation.svg', 
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    }),
    'weather': L.icon({
      iconUrl: '/icons/weather-station.svg',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    })
  };
  
  return iconMap[type] || L.icon.Default;
};

const MapPage = () => {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center of India
  const [zoom, setZoom] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLayer, setActiveLayer] = useState('standard');
  const [showLabels, setShowLabels] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [ndviData, setNdviData] = useState({});
  
  useEffect(() => {
    if (user) {
      fetchFields();
      useCurrentLocation();
    }
  }, [user]);
  
  const fetchFields = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/fields/user/${user._id}`);
      setFields(response.data);
      
      // If fields exist, center the map on the first field
      if (response.data.length > 0) {
        const firstField = response.data[0];
        setMapCenter(firstField.centerCoordinates);
        setZoom(16);
      }
      
      // Fetch NDVI data for each field
      response.data.forEach(field => {
        fetchNdviData(field._id);
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching fields:', err);
      setError('Failed to load field data');
      setLoading(false);
    }
  };
  
  const fetchNdviData = async (fieldId) => {
    try {
      const response = await axios.get(`/api/fields/${fieldId}/ndvi`);
      setNdviData(prev => ({
        ...prev,
        [fieldId]: response.data
      }));
    } catch (err) {
      console.error('Error fetching NDVI data:', err);
    }
  };
  
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (err) => {
          console.error('Error getting location:', err);
        }
      );
    }
  };
  
  // Get field health status color
  const getHealthColor = (status) => {
    switch(status) {
      case 'healthy': return '#4CAF50';
      case 'moderate': return '#FFC107';
      case 'at risk': return '#F44336';
      default: return '#4CAF50';
    }
  };
  
  // Get NDVI color based on value
  const getNdviColor = (value) => {
    if (value === undefined) return '#CCCCCC';
    
    if (value < 0) return '#A52A2A'; // Brown for negative NDVI (bare soil, water)
    if (value < 0.2) return '#FFFF00'; // Yellow for low vegetation
    if (value < 0.4) return '#ADFF2F'; // Green-yellow for moderate vegetation
    if (value < 0.6) return '#32CD32'; // Lime green for good vegetation
    return '#006400'; // Dark green for excellent vegetation
  };
  
  // Calculate crop yield estimate based on field data
  const calculateYieldEstimate = (field) => {
    // Sample yield calculation (would be more sophisticated in production)
    const cropYieldFactors = {
      'rice': 3.5,  // tons per hectare
      'wheat': 3.0,
      'cotton': 1.8,
      'sugarcane': 70,
      'pulses': 0.8,
      'maize': 3.2,
      'vegetables': 15
    };
    
    const baseYield = cropYieldFactors[field.cropType.toLowerCase()] || 2.5;
    
    // Adjust based on health
    const healthFactor = field.healthStatus === 'healthy' ? 1.0 : 
                       field.healthStatus === 'moderate' ? 0.8 : 0.6;
    
    // Adjust based on NDVI if available
    let ndviFactor = 1.0;
    if (ndviData[field._id] && ndviData[field._id].length > 0) {
      const latestNdvi = ndviData[field._id].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )[0].value;
      
      ndviFactor = 0.7 + (latestNdvi + 1) * 0.25;
    }
    
    return (baseYield * field.area * healthFactor * ndviFactor).toFixed(2);
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopBar title="Farm Map" />
      
      <div className="flex-grow relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p>Loading map data...</p>
            </div>
          </div>
        ) : null}
        
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="text-center text-red-500 p-4">
              <p>{error}</p>
              <button 
                onClick={fetchFields}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : null}
        
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              />
            </LayersControl.BaseLayer>
            
            <LayersControl.Overlay checked name="Field Boundaries">
              <LayerGroup>
                {fields.map((field) => (
                  <Polygon 
                    key={field._id}
                    positions={field.boundaries}
                    pathOptions={{
                      color: getHealthColor(field.healthStatus),
                      fillOpacity: 0.4,
                      weight: 2
                    }}
                    eventHandlers={{
                      click: () => setSelectedField(field)
                    }}
                  >
                    {showLabels && (
                      <Popup>
                        <div className="text-center">
                          <h3 className="font-bold text-lg">{field.name}</h3>
                          <p>Crop: {field.cropType}</p>
                          <p>Area: {field.area.toFixed(2)} hectares</p>
                          <p>Status: {field.healthStatus}</p>
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <p className="text-sm text-gray-600">Estimated Yield</p>
                            <p className="text-xl font-bold text-green-700">
                              {calculateYieldEstimate(field)} tons
                            </p>
                          </div>
                        </div>
                      </Popup>
                    )}
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
            
            <LayersControl.Overlay checked={showSensors} name="Sensors">
              <LayerGroup>
                {fields.map((field) => (
                  field.sensorLocations && field.sensorLocations.map((sensor, idx) => (
                    <Marker 
                      key={`sensor-${field._id}-${idx}`}
                      position={[sensor.lat, sensor.lng]}
                      icon={createSensorIcon(sensor.type)}
                    >
                      <Popup>
                        <div>
                          <h4 className="font-bold">{sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor</h4>
                          <p>Field: {field.name}</p>
                          <p>Last reading: {sensor.lastReading || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            Last updated: {new Date(sensor.lastUpdated).toLocaleString()}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  ))
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
            
            <LayersControl.Overlay name="NDVI Data">
              <LayerGroup>
                {fields.map((field) => (
                  <Polygon 
                    key={`ndvi-${field._id}`}
                    positions={field.boundaries}
                    pathOptions={{
                      color: '#000',
                      fillColor: getNdviColor(
                        ndviData[field._id]?.length > 0 
                          ? ndviData[field._id].sort((a, b) => new Date(b.date) - new Date(a.date))[0].value 
                          : undefined
                      ),
                      fillOpacity: 0.7,
                      weight: 1
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-bold">{field.name}</h3>
                        <p>NDVI Value: {
                          ndviData[field._id]?.length > 0 
                            ? ndviData[field._id].sort((a, b) => new Date(b.date) - new Date(a.date))[0].value.toFixed(2)
                            : 'No data'
                        }</p>
                        <p className="text-xs text-gray-500">
                          Higher values indicate healthier vegetation
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
        
        {/* Map controls overlay */}
        <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-md p-2 z-[1000]">
          <button 
            onClick={useCurrentLocation}
            className="w-10 h-10 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full mb-2"
            aria-label="My Location"
          >
            📍
          </button>
          <button 
            onClick={() => setShowLabels(!showLabels)}
            className={`w-10 h-10 flex items-center justify-center ${showLabels ? 'bg-green-500' : 'bg-gray-400'} text-white rounded-full mb-2`}
            aria-label="Toggle Labels"
          >
            🏷️
          </button>
          <button 
            onClick={() => setShowSensors(!showSensors)}
            className={`w-10 h-10 flex items-center justify-center ${showSensors ? 'bg-green-500' : 'bg-gray-400'} text-white rounded-full`}
            aria-label="Toggle Sensors"
          >
            📊
          </button>
        </div>
        
        {/* Field detail panel */}
        {selectedField && (
          <div className="absolute bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 mx-2 rounded-t-lg shadow-lg">
            <div className="flex justify-between">
              <h3 className="font-bold text-xl">{selectedField.name}</h3>
              <button 
                onClick={() => setSelectedField(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-600">Crop</p>
                <p className="font-bold">{selectedField.cropType}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-600">Size</p>
                <p className="font-bold">{selectedField.area.toFixed(2)} ha</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-600">Health</p>
                <p className="font-bold" style={{color: getHealthColor(selectedField.healthStatus)}}>
                  {selectedField.healthStatus}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-sm text-gray-600">Est. Yield</p>
                <p className="font-bold text-green-700">
                  {calculateYieldEstimate(selectedField)} tons
                </p>
              </div>
            </div>
            
            <div className="mt-3 flex space-x-2">
              <button className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm">
                Detailed Analysis
              </button>
              <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm">
                Add Sensor
              </button>
            </div>
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
};

export default MapPage;