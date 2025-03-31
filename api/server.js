import express from 'express';
import cors from 'cors';
import { calculateNumerologyData } from './utils/numerologyUtils.js';
import { generateNumerologyReport } from './utils/reportGenerator.js'; // Import the report generator

const app = express();
const port = process.env.PORT || 3001;

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
      // Return only the calculation data, report generation moved to separate endpoint
      res.json(numerologyData);
    } else {
      // calculateNumerologyData returns null for invalid input format/values
      res.status(400).json({ error: 'Invalid input data provided (e.g., date format, values).' });
    }
  } catch (error) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: 'An internal server error occurred during calculation.' });
  }
});

// --- NEW: API Endpoint for PDF Report Generation ---
import PDFDocument from 'pdfkit';

app.get('/api/report/pdf', (req, res) => {
  const { dob, gender } = req.query; // Get data from query parameters

  // Basic validation
  if (!dob || !gender) {
    return res.status(400).json({ error: 'Missing required query parameters: dob and gender' });
  }

  try {
    const numerologyData = calculateNumerologyData(dob, gender);

    if (!numerologyData) {
      return res.status(400).json({ error: 'Invalid input data provided (e.g., date format, values).' });
    }

    // Generate the report string
    const reportString = generateNumerologyReport(numerologyData);

    // Create a new PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    // Set headers for PDF download
    const filename = `Numerology_Report_${dob.replace(/-/g, '')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe the PDF document directly to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(18).text('Numerology Insights Report', { align: 'center', underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Date of Birth: ${dob}`);
    doc.text(`Gender: ${gender}`); // Assuming gender is relevant for the report context
    doc.moveDown(2);

    // Add the generated report string
    doc.font('Helvetica').fontSize(10).text(reportString, {
      align: 'left',
      lineGap: 4,
    });

    // Finalize the PDF and end the stream
    doc.end();

  } catch (error) {
    console.error('PDF Generation error:', error);
    // Avoid sending partial PDF if error occurs mid-stream
    if (!res.headersSent) {
      res.status(500).json({ error: 'An internal server error occurred during PDF generation.' });
    } else {
      // If headers already sent, we might just have to end the response abruptly
      res.end();
    }
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Numerology API server listening on port ${port}`);
});
