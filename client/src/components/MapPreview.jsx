import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPreview = ({ userId, expanded, setExpanded }) => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default center of India
  const [zoom, setZoom] = useState(5);
  const [sensorData, setSensorData] = useState({});

  // Fetch farmer's fields data
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/fields/user/${userId}`);
        setFields(response.data);
        
        // If fields exist, center the map on the first field
        if (response.data.length > 0) {
          const firstField = response.data[0];
          setMapCenter(firstField.centerCoordinates || [firstField.boundaries[0][0], firstField.boundaries[0][1]]);
          setZoom(16);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load field data');
        setLoading(false);
      }
    };
    
    fetchFields();
  }, [userId]);

  // Fetch sensor data when a field is selected
  useEffect(() => {
    if (selectedField) {
      const fetchSensorData = async () => {
        try {
          // Fetch groundwater sensor data
          const groundwaterResponse = await axios.get(`/api/sensors/groundwater/${selectedField._id}`);
          
          // Fetch irrigation sensor data
          const irrigationResponse = await axios.get(`/api/sensors/irrigation/${selectedField._id}`);
          
          setSensorData({
            groundwater: groundwaterResponse.data,
            irrigation: irrigationResponse.data
          });
        } catch (err) {
          console.error('Failed to fetch sensor data:', err);
        }
      };
      
      fetchSensorData();
    }
  }, [selectedField]);

  // Calculate yield estimate based on field size, crop type, and health status
  const calculateYieldEstimate = (field) => {
    // Sample yield calculation logic (this would be more sophisticated in production)
    const cropYieldFactors = {
      'rice': 3.5,  // tons per hectare
      'wheat': 3.0,
      'cotton': 1.8,
      'sugarcane': 70,
      'pulses': 0.8
    };
    
    // Calculate area in hectares using shoelace formula
    const calculateArea = (vertices) => {
      let area = 0;
      for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        area += vertices[i][0] * vertices[j][1];
        area -= vertices[j][0] * vertices[i][1];
      }
      return Math.abs(area) / 2 / 10000; // Convert square meters to hectares
    };
    
    const areaHectares = calculateArea(field.boundaries);
    const baseYield = cropYieldFactors[field.cropType] || 2.5; // Default if crop not in our factors
    
    // Adjust based on health (simplistic model - would be more sophisticated with real data)
    const healthFactor = field.healthStatus === 'healthy' ? 1.0 : 
                         field.healthStatus === 'moderate' ? 0.8 : 0.6;
    
    return (baseYield * areaHectares * healthFactor).toFixed(2);
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

  const handleFieldClick = (field) => {
    setSelectedField(field);
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (loading) return <div className="p-4 text-center">Loading map data...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${expanded ? 'fixed inset-0 z-50' : 'relative'}`}>
      <div className="p-3 bg-green-700 text-white flex justify-between items-center">
        <h3 className="font-medium">Your Farm Map</h3>
        <button 
          onClick={toggleExpand} 
          className="bg-green-600 hover:bg-green-800 text-white px-3 py-1 rounded-full text-sm"
        >
          {expanded ? 'Close Map' : 'Expand Map'}
        </button>
      </div>
      
      <div className={`relative ${expanded ? 'h-[calc(100%-120px)]' : 'h-48'}`}>
        <MapContainer 
          center={mapCenter} 
          zoom={zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {fields.map((field) => (
            <React.Fragment key={field._id}>
              <Polygon 
                positions={field.boundaries}
                pathOptions={{
                  color: getHealthColor(field.healthStatus),
                  fillOpacity: 0.4,
                }}
                eventHandlers={{
                  click: () => handleFieldClick(field)
                }}
              />
              
              {/* Sensor markers if available */}
              {field.sensorLocations && field.sensorLocations.map((sensor, idx) => (
                <Marker 
                  key={`sensor-${field._id}-${idx}`}
                  position={[sensor.lat, sensor.lng]}
                >
                  <Popup>
                    {sensor.type} Sensor <br />
                    Last reading: {sensor.lastReading || 'N/A'}
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          ))}
        </MapContainer>
      </div>
      
      {/* Field info panel when expanded */}
      {expanded && selectedField && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 h-[120px] overflow-y-auto">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{selectedField.name || 'Field Details'}</h3>
              <p className="text-gray-600">Crop: {selectedField.cropType}</p>
              <p className="text-gray-600">Size: {(selectedField.area || 0).toFixed(2)} hectares</p>
              <p className="text-gray-600">Health: <span style={{color: getHealthColor(selectedField.healthStatus)}}>{selectedField.healthStatus}</span></p>
            </div>
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-gray-600">Estimated Yield</p>
                <p className="text-2xl font-bold text-green-700">{calculateYieldEstimate(selectedField)} tons</p>
              </div>
            </div>
          </div>
          
          {/* Sensor data display if available */}
          {sensorData.groundwater && (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-gray-600">Groundwater Level</p>
                <p className="font-bold">{sensorData.groundwater.level}m</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-gray-600">Soil Moisture</p>
                <p className="font-bold">{sensorData.irrigation?.moisture || 'N/A'}%</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Small preview mode info */}
      {!expanded && fields.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-80 p-2 text-center text-sm">
          {fields.length} field{fields.length !== 1 ? 's' : ''} mapped | Tap to view details
        </div>
      )}
      
      {/* Empty state */}
      {!loading && fields.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="text-center p-4">
            <p className="mb-2">No fields mapped yet</p>
            <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
              + Add Your First Field
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapPreview;