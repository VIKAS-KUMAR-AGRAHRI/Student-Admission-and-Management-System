const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = new Schema({
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['STUDENT', 'ADMIN', 'FACULTY'],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const FAQ = mongoose.model('faq', faqSchema);

module.exports = FAQ;