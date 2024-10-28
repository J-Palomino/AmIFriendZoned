import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import cors from 'cors'; 

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3001; 

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// only for DEV
app.use(cors())

app.post('/api/upload', async (req, res) => {
    console.log('Received sentiment analysis request');
    
    try {
      if (!req.body.text || !Array.isArray(req.body.text)) {
        throw new Error('Invalid input: expecting array of text documents');
      }
      console.log('Received text:', req.body);
      // Combine all texts with proper spacing
      const cleanText = req.body.text
        .map((doc: { document: string, text: string }) => doc.text)
        .join(' ')
        .replace(/[\r\n]+/g, ' ')
      
      // Send to R server
      const response = await axios.post('http://0.0.0.0:8000/sentiment', {
        text: cleanText
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Received response from R server:', response.data);
      res.status(200).json(response.data);
  
    } catch (error: any) {
      console.error('Error in sentiment analysis:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      res.status(500).json({ 
        success: false,
        error: 'Error processing sentiment analysis',
        details: error.response?.data || error.message 
      });
    }
  });


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/sentiment - Analyze text sentiment');
  console.log('  POST /api/upload - Process uploaded files');
});