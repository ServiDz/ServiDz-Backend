const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // ✅ correct path

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const upload = multer({ storage });

module.exports = upload;
