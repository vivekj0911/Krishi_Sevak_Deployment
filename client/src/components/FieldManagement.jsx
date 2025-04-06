import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import axios from 'axios';

const FieldManagement = ({ userId, onFieldCreated }) => {
  const [fieldName, setFieldName] = useState('');
  const [cropType, setCropType] = useState('');
  const [boundaries, setBoundaries] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [zoom, setZoom] = useState(5);
  
  const mapRef = useRef();
  const featureGroupRef = useRef();
  
  // Common crop types in India
  const cropOptions = [
    'rice', 'wheat', 'cotton', 'sugarcane', 'pulses', 
    'maize', 'millets', 'oilseeds', 'vegetables', 'fruits'
  ];

  // Use device location to center map
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setMessage('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setZoom(16); // Zoom in closer
          setMessage(null);
        },
        (err) => {
          setError('Unable to get your location. Please map manually.');
          console.error(err);
        }
      );
    } else {
      setError('Geolocation is not supported by your device or browser.');
    }
  };

  const handleDrawCreated = (e) => {
    const layer = e.layer;
    
    // Get coordinates from the drawn shape
    const drawnCoordinates = layer.getLatLngs()[0].map(point => [point.lat, point.lng]);
    setBoundaries(drawnCoordinates);
    
    // Calculate the center point
    const centerLat = drawnCoordinates.reduce((sum, point) => sum + point[0], 0) / drawnCoordinates.length;
    const centerLng = drawnCoordinates.reduce((sum, point) => sum + point[1], 0) / drawnCoordinates.length;
    
    // Calculate approximate area (in hectares)
    const area = calculateArea(drawnCoordinates);
    
    setCurrentStep(2);
    setMessage(`Field drawn! Approximate size: ${area.toFixed(2)} hectares`);
  };
  
  // Calculate area using shoelace formula (simplified for small areas)
  const calculateArea = (vertices) => {
    let area = 0;
    for (let i = 0; i < vertices.length; i++) {
      const j = (i + 1) % vertices.length;
      area += vertices[i][0] * vertices[j][1];
      area -= vertices[j][0] * vertices[i][1];
    }
    // Convert to absolute value and adjust for Earth's curvature (very approximate)
    // and convert to hectares
    return Math.abs(area) * 111319 * 111319 / 10000; 
  };

  const saveField = async () => {
    if (!fieldName || !cropType || !boundaries) {
      setError('Please fill all fields and draw your field boundary');
      return;
    }
    
    try {
      setIsCreating(true);
      
      // Calculate center coordinates
      const centerLat = boundaries.reduce((sum, point) => sum + point[0], 0) / boundaries.length;
      const centerLng = boundaries.reduce((sum, point) => sum + point[1], 0) / boundaries.length;
      
      const area = calculateArea(boundaries);
      
      const response = await axios.post('/api/fields', {
        userId,
        name: fieldName,
        cropType,
        boundaries,
        centerCoordinates: [centerLat, centerLng],
        area,
        healthStatus: 'healthy' // Default initial status
      });
      
      setMessage('Field saved successfully!');
      if (onFieldCreated) onFieldCreated(response.data);
      
      // Reset form
      setFieldName('');
      setCropType('');
      setBoundaries(null);
      setCurrentStep(1);
      
      // Clear the drawn items
      if (featureGroupRef.current) {
        const leafletFG = featureGroupRef.current.leafletElement;
        if (leafletFG) leafletFG.clearLayers();
      }
      
    } catch (err) {
      setError('Failed to save field. Please try again.');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };
  
  // Simple walkthrough for farmers
  const getStepInstructions = () => {
    switch(currentStep) {
      case 1:
        return "Use your finger to tap on the map corners of your field. Complete the shape by connecting back to the first point.";
      case 2:
        return "Now give your field a name and select the crop you're growing.";
      default:
        return "";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-3 bg-green-700 text-white">
        <h3 className="font-medium">Add New Field</h3>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-2 mb-2">
          <p>{error}</p>
        </div>
      )}
      
      {message && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-2">
          <p>{message}</p>
        </div>
      )}
      
      <div className="p-3">
        <p className="text-gray-600 mb-2 text-sm">{getStepInstructions()}</p>
        
        <button 
          onClick={useCurrentLocation}
          className="mb-3 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">📍</span> Use My Current Location
        </button>
        
        <div className="h-64 relative mb-3 border rounded-lg overflow-hidden">
          <MapContainer 
            center={mapCenter} 
            zoom={zoom} 
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <FeatureGroup ref={featureGroupRef}>
              <EditControl
                position="topright"
                onCreated={handleDrawCreated}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                  polygon: {
                    allowIntersection: false,
                    drawError: {
                      color: '#e1e100',
                      message: '<strong>Field boundaries cannot cross!</strong>'
                    },
                    shapeOptions: {
                      color: '#3388ff'
                    }
                  }
                }}
                edit={{
                  remove: true
                }}
              />
            </FeatureGroup>
          </MapContainer>
          
          {currentStep === 1 && (
            <div className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded shadow-md text-xs">
              Draw your field by tapping points around its boundary
            </div>
          )}
        </div>
        
        {currentStep >= 2 && (
          <>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Field Name
              </label>
              <input
                type="text"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder="e.g., North Field, Rice Paddy"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Crop Type
              </label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select crop</option>
                {cropOptions.map(crop => (
                  <option key={crop} value={crop}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={saveField}
              disabled={isCreating}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg flex items-center justify-center"
            >
              {isCreating ? 'Saving...' : 'Save Field'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default FieldManagement;