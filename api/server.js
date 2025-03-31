import express from 'express';
import cors from 'cors';
import { calculateNumerologyData } from './utils/numerologyUtils.js'; // Use .js extension for relative imports in ESM

const app = express();
const port = process.env.PORT || 3001; // Use environment variable or default port

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Parse JSON request bodies

// API Endpoint for Numerology Calculation
app.post('/api/calculate', (req, res) => {
  const { dob, gender } = req.body;

  // Basic validation for presence of dob and gender
  if (!dob || !gender) {
    return res.status(400).json({ error: 'Missing required fields: dob and gender' });
  }

  try {
    const numerologyData = calculateNumerologyData(dob, gender);

    if (numerologyData) {
      res.json(numerologyData); // Send back the calculated data
    } else {
      // calculateNumerologyData returns null for invalid input format/values
      res.status(400).json({ error: 'Invalid input data provided (e.g., date format, values).' });
    }
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'An internal server error occurred during calculation.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Numerology API server listening on port ${port}`);
});
