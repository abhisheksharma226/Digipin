const express = require('express');
const router = express.Router();
const { getDigiPin, getLatLngFromDigiPin } = require('../digipin');
const QRCode = require('qrcode');
const fs = require("fs");
const path = require("path");

router.post('/encode', (req, res) => { const { latitude, longitude } = req.body; try { const code = getDigiPin(latitude, longitude); res.json({ digipin: code }); } catch (e) { res.status(400).json({ error: e.message }); } });

router.post('/decode', (req, res) => { const { digipin } = req.body; try { const coords = getLatLngFromDigiPin(digipin); res.json(coords); } catch (e) { res.status(400).json({ error: e.message }); } });

  router.get('/encode', (req, res) => {
    const { latitude, longitude } = req.query;
    try {
      const code = getDigiPin(parseFloat(latitude), parseFloat(longitude));
      res.json({ digipin: code });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  
  router.get('/decode', (req, res) => {
    const { digipin } = req.query;
    try {
      const coords = getLatLngFromDigiPin(digipin);
      res.json(coords);
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

// Generate QR Code for a given DigiPin
router.get("/qrcode/:digipin", async (req, res) => {
  const { digipin } = req.params;

  if (!digipin || digipin.length < 5) {
    return res.status(400).json({ error: "Invalid DigiPin provided." });
  }

  try {
    // 1. Decode DigiPin
    const { latitude, longitude } = getLatLngFromDigiPin(digipin);

    // 2. Generate Google Maps URL
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

    // 3. Path setup
    const qrDir = path.join(__dirname, "..", "public", "qr");
    const qrImagePath = path.join(qrDir, `${digipin}.png`);
    const qrImageUrl = `/static/qr/${digipin}.png`;

    // 4. Ensure qr folder exists
    fs.mkdirSync(qrDir, { recursive: true });

    // 5. Generate & save QR code
    await QRCode.toFile(qrImagePath, mapsUrl);

    // 6. Read QR image as base64
    const qrBuffer = fs.readFileSync(qrImagePath);
    const qrBase64 = qrBuffer.toString("base64");

    // 7. Send response
    res.json({
      latitude,
      longitude,
      mapsUrl,
      qrImageUrl: `http://localhost:5000${qrImageUrl}`,
      qrImageBase64: qrBase64
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate QR", detail: e.message });
  }
});


  
module.exports = router;