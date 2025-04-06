// server/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // If no token, we'll still proceed but mark the request as unauthenticated
  if (!token) {
    req.isAuthenticated = false;
    req.user = null;
    return next();
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Add user from payload
    req.user = decoded;
    req.isAuthenticated = true;
    next();
  } catch (err) {
    // Invalid token, but we'll still proceed
    req.isAuthenticated = false;
    req.user = null;
    next();
  }
};