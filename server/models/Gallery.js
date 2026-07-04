import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['photo', 'video'],
    default: 'photo'
  },
  url: {
    type: String,
    required: true
  },
  album: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true // e.g., 'Darshan', 'Festivals', 'Seva', 'Inauguration'
  }
}, { timestamps: true });

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
