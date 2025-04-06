const mongoose = require('mongoose');

const IrrigationLogSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  crop: {
    type: String
  },
  triggerType: {
    type: String,
    enum: ['auto', 'manual'],
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['completed', 'in-progress', 'failed'],
    default: 'completed'
  }
});

module.exports = mongoose.model('IrrigationLog', IrrigationLogSchema);
