const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['feedback', 'bug', 'complaint', 'feature_request'], required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved'], default: 'Open' },
    adminResponse: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
