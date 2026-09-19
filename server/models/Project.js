const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  }
}, { timestamps: true });
projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);

module.exports = mongoose.model('Project', projectSchema);