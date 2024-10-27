import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';
import cors from 'cors'; 

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3001; 

interface SuccessResponse {
    success: true;
    data: {
      isRomantic: boolean;      // true if romantic, false if friendzone
      score: number;            // sentiment score from 0-100
      stats: {
        totalSentences: number; // total number of sentences analyzed
        positiveSentences: number;
        negativeSentences: number;
        neutralSentences: number;
      }
    }
  }
//   app.use(cors({
//     origin: 'http://localhost:3000', // Your frontend URL
//     methods: ['GET', 'POST'],
//     allowedHeaders: ['Content-Type']
//   }));

  // only fort DEV
  app.use(cors())

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      // Convert file contents to text
      const fileContents = req.file ? await fs.promises.readFile(req.file.path, 'utf8') : '';
      
      // Clean up the text and split into sentences
      const cleanText = fileContents
        .trim()
        .replace(/[\r\n]+/g, ' ')  // Replace newlines with spaces
        .replace(/\s+/g, ' ');     // Remove extra spaces
      
      // Create the payload
      const payload = {
        document: 1,
        text: cleanText
      };
      
      console.log('Sending payload:', payload);
      
      const response = await axios.post('http://0.0.0.0:8000/sentiment', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Received response:', response.data);

      // Clean up uploaded file
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path);
      }

      // Format the response with safe fallbacks
      const result = {
        success: true,
        data: {
          isRomantic: response.data?.romantic ?? false,
          score: Math.round((response.data?.sentiment_score ?? 0) * 100),
          stats: {
            totalSentences: response.data?.details?.total_sentences ?? 0,
            positiveSentences: response.data?.details?.positive_sentences ?? 0,
            negativeSentences: response.data?.details?.negative_sentences ?? 0,
            neutralSentences: response.data?.details?.neutral_sentences ?? 0
          }
        }
      };
      
      console.log('Sending result:', result);
      res.status(200).json(result);

    } catch (error: any) {

      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack,
        rawResponse: error.response // Add full response for debugging
      });
      res.status(500).json({ 
        success: false,
        error: 'Error processing file',
        details: error.response?.data || error.message 
      });
      
    }
    
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});