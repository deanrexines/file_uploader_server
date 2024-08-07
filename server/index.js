const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors())

// Set up storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// POST route to upload file
app.post('/upload', upload.single('file'), (req, res) => {
  res.status(200).send({ message: 'File uploaded successfully', filename: req.file.filename });
});

// GET route to fetch all uploaded files
app.get('/uploads', (req, res) => {
  const uploadPath = path.join(__dirname, 'uploads');
  fs.readdir(uploadPath, (err, files) => {
    if (err) {
      res.status(500).send({ message: 'Unable to fetch files' });
    } else {
      res.status(200).send(files);
    }
  });
});

// DELETE route to delete file by filename
app.delete('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (err) => {
        if (err) {
          return res.status(500).send({ message: 'Error deleting file' });
        }
        res.status(200).send({ message: 'File deleted successfully' });
      });
    } else {
      res.status(404).send({ message: 'File not found' });
    }
  });

// Server listener
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

