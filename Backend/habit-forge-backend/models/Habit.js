const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'اسم العادة مطلوب'],
    trim: true,
    minlength: [2, 'الاسم يجب أن يكون حرفين على الأقل']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  completedDates: [
    {
      date: {
        type: Date,
        required: true
      },
      mood: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      },
      note: {
        type: String,
        default: ''
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Habit', habitSchema);