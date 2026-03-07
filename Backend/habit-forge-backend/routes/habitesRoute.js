const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Habit = require('../models/Habit');

// GET /api/habits
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id });
    res.json(habits);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// POST /api/habits
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, frequency } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'اسم العادة مطلوب' });
    }
    const habit = await Habit.create({
      user: req.user.id,
      title,
      description,
      frequency
    });
    res.status(201).json(habit);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// PUT /api/habits/:id/complete
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const { mood, note } = req.body;
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: 'العادة غير موجودة' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyDone = habit.completedDates.some(entry => {
      const d = new Date(entry.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    if (alreadyDone) {
      return res.status(400).json({ message: 'تم تسجيل هذه العادة اليوم بالفعل' });
    }

    habit.completedDates.push({
      date: today,
      mood: mood || 5,
      note: note || ''
    });

    await habit.save();
    res.json(habit);
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

// DELETE /api/habits/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ message: 'العادة غير موجودة' });
    }
    res.json({ message: 'تم حذف العادة' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في الخادم' });
  }
});

module.exports = router;