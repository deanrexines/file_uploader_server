const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { File, initDb } = require('./database');
const cors = require('cors');

const PORT = 8080;

const app = express();
app.use(cors());
initDb();

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });

const upload = multer({ storage });

// POST route to upload file
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      const { filename, path: filePath } = req.file;
      await File.create({ filename, path: filePath, timestamp: new Date() });
      res.status(200).send({ message: 'File uploaded successfully', filename });
    } catch (error) {
      res.status(500).send({ message: 'Error uploading file' });
    }
  });

// GET route to fetch all uploaded files
app.get('/uploads', async (req, res) => {
    try {
      const files = await File.findAll();
      res.status(200).send(files.map(file => ({
        filename: file.filename,
        path: file.path,
        timestamp: file.timestamp
      })));
    } catch (error) {
      res.status(500).send({ message: 'Error fetching files' });
    }
  });

// DELETE route to delete file by filename
app.delete('/files/:filename', async (req, res) => {
    const filename = req.params.filename;
    try {
      const file = await File.findOne({ where: { filename } });
      if (!file) {
        return res.status(404).send({ message: 'File not found' });
      }
  
      fs.unlink(file.path, async (err) => {
        if (err) {
          return res.status(500).send({ message: 'Error deleting file' });
        }
  
        await File.destroy({ where: { filename } });
        res.status(200).send({ message: 'File deleted successfully' });
      });
    } catch (error) {
      res.status(500).send({ message: 'Error deleting file' });
    }
  });

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});