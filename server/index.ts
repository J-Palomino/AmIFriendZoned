import express from 'express';
import multer from 'multer';
import axios from 'axios';
import fs from 'fs';

const app = express();
const upload = multer({ dest: 'uploads/' });
const PORT = 3001; 

app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      // Convert file contents to text
      const fileContents = req.file ? await fs.promises.readFile(req.file.path, 'utf8') : '';
      
      // Clean up the text (remove extra whitespace, etc)
      const cleanText = fileContents.trim();
      
      // Create the payload
      const payload = {
        document: 1,
        text: cleanText
      };
      
      console.log('Sending payload to R API:', payload);
      
      const response = await axios.post('http://0.0.0.0:8000/sentiment', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      // Clean up uploaded file
      if (req.file?.path) {
        await fs.promises.unlink(req.file.path);
      }
  
      res.json(response.data);
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      res.status(500).json({ 
        error: 'Error processing file',
        details: error.response?.data || error.message 
      });
    }
});
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});