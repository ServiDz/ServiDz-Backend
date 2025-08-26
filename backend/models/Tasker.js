const mongoose = require('mongoose');

const taskerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },           
  role: { type: String, default: 'tasker' },             
  profession: { type: String, required: true },
  location: { type: String, required: true },
  phone: { type: String, required: true },
  rating: { type: Number, default: 0 }, // Keep as average rating
ratings: [
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    value: { type: Number, required: true },
    review: { type: String }, // ✅ Add this line
    ratedAt: { type: Date, default: Date.now }
  }
],


  isAvailable: { type: Boolean, default: true },
  certifications: [
  {
    filePath: { type: String},
    description: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }
],

  profilePic: { type: String },
  description: { type: String },
  refreshToken: { type: String },                       
  createdAt: { type: Date, default: Date.now },
  fcmToken: { type: String },
   status: {
        type: String,
        enum: ['Active', 'Inactive', 'Suspended'],
        default: 'Active'
    }

});

module.exports = mongoose.model('Tasker', taskerSchema);
