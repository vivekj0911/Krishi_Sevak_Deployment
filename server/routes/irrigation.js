const express = require('express');
const router = express.Router();
const IrrigationLog = require('../models/IrrigationLog');

// POST - Log irrigation event
router.post('/', async (req, res) => {
  try {
    const newLog = new IrrigationLog(req.body);
    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET - All irrigation logs
router.get('/', async (req, res) => {
  try {
    const logs = await IrrigationLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
