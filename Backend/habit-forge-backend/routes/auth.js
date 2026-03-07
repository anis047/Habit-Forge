// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── helper لتوليد التوكن ───────────────────────────────────────────
const signToken = (userId) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      { user: { id: userId } },       // ✅ payload موحّد
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => (err ? reject(err) : resolve(token))
    );
  });

// POST /api/auth/register ────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const user = await User.create({ name, email, password });

    const token = await signToken(user.id); // ✅ async/await بدل callback
    return res.status(201).json({ token });

  } catch (err) {
    console.error('Register error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    return res.status(500).json({ message: 'خطأ داخلي في الخادم' });
  }
});

// POST /api/auth/login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
  }

  try {
    const user = await User.findOne({ email });
if (!user) {
  console.log('❌ المستخدم غير موجود:', email);
  return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
}

console.log('✅ المستخدم موجود، كلمة المرور المحفوظة:', user.password);
const isMatch = await user.comparePassword(password);
console.log('🔑 نتيجة المقارنة:', isMatch);
    if (!isMatch) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }

    const token = await signToken(user.id); // ✅ catch يشمل أخطاء JWT
    return res.status(200).json({ token });

  } catch (err) {
    console.error('Login error:', err.message); // ✅ message فقط لا الـ stack
    return res.status(500).json({ message: 'خطأ داخلي في الخادم' }); // ✅ 500 صريحة
  }
});

module.exports = router;