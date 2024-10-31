//backend/routes/imageUpload.ts
import express from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/awsConfig';
import { GetObjectCommand } from '@aws-sdk/client-s3';

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME!,
    acl: 'public-read', // Ställ in lämplig åtkomstkontroll
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

router.post('/upload', upload.single('file'), (req, res) => {
  console.log("File upload request received.");
  if (!req.file) {
    console.error("No file uploaded.");
    return res.status(400).send({ message: 'Ingen fil uppladdad' });
  }
  console.log('File uploaded:', req.file);
  res.status(201).json({ file: req.file });
});

router.get('/files/:filename', async (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: req.params.filename,
  };

  try {
    const command = new GetObjectCommand(params);
    const data = await s3.send(command);
    
    res.setHeader('Content-Type', data.ContentType!);
    res.send(data.Body);
  } catch (err) {
    console.error('Error fetching file from S3:', err);
    res.status(500).send({ message: 'Error fetching file from S3' });
  }
});

export default router;
