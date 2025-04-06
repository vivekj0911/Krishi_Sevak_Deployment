const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  crop: {
    type: String,
  },
  area: {
    type: Number, // in sq.m (optional)
  },
  lastIrrigated: {
    type: Date,
  },
  currentHumidity: {
    type: Number,
    required: true
  },
  thresholdMin: {
    type: Number,
    required: true
  },
  thresholdMax: {
    type: Number,
    required: true
  },
  autoIrrigation: {
    type: Boolean,
    default: true
  },
  irrigationDuration: {
    type: Number,
    default: 10 // minutes
  }
});

module.exports = mongoose.model('Field', FieldSchema);
