const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    default: 'Untitled Project'
  },
  imageData: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  selection: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  }
}, { timestamps: true });

projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);