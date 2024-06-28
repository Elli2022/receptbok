import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const router = express.Router();

// Skapa "uploads"-mappen om den inte redan finns
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Konfigurera Multer för filuppladdning
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Spara filer i en lokal mapp "uploads"
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        console.error('Error generating filename:', err);
        return cb(err, '');
      }
      const filename = buf.toString('hex') + path.extname(file.originalname);
      cb(null, filename);
    });
  }
});
const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  console.log("File upload request received.");
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).send({ message: 'Ingen fil uppladdad' });
  }
  console.log('File uploaded:', req.file);
  res.status(201).json({ file: req.file });
});

router.get('/files/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  console.log('Sending file:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send({ message: 'Error sending file' });
    }
  });
});

router.get('/image/:filename', (req, res) => {
  const filePath = path.join(uploadDir, req.params.filename);
  console.log('Sending image:', filePath);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending image:', err);
      res.status(500).send({ message: 'Error sending image' });
    }
  });
});

export default router;
