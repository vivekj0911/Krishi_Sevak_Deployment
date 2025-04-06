const express = require('express');
const router = express.Router();
const Field = require('../models/Field');
const IrrigationLog = require('../models/IrrigationLog');
const sendSMS = require('../utils/sendSMS'); // 📲 Twilio SMS utility

// ✅ GET all fields
router.get('/', async (req, res) => {
  try {
    const fields = await Field.find();
    res.json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST - create a new field
router.post('/', async (req, res) => {
  try {
    const field = new Field(req.body);
    const saved = await field.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ✅ PUT - update humidity and trigger auto irrigation
router.put('/:id/update-humidity', async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ message: 'Field not found' });

    const { currentHumidity } = req.body;
    field.currentHumidity = currentHumidity;

    // 🔁 Auto-irrigation trigger
    if (field.autoIrrigation && currentHumidity < field.thresholdMin) {
      field.lastIrrigated = new Date();

      // 💾 Log the irrigation
      await IrrigationLog.create({
        field: field.name,
        crop: field.crop,
        triggerType: 'auto',
        humidity: currentHumidity,
        duration: field.irrigationDuration,
        status: 'completed'
      });

      // 📲 Send SMS
      const farmerPhone = '+918459708577'; // Replace with dynamic or actual value
      await sendSMS(
        farmerPhone,
        `💧 Auto irrigation started for "${field.name}" (Humidity: ${currentHumidity}%).`
      );

      console.log(`✅ Auto irrigation triggered for ${field.name}`);
    }

    const updated = await field.save();
    res.json(updated);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
