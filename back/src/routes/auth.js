const express = require('express');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  // TODO: 실제 로그인 로직 구현
  res.json({ message: 'Login endpoint' });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
  // TODO: 실제 회원가입 로직 구현
  res.json({ message: 'Register endpoint' });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // TODO: 실제 로그아웃 로직 구현
  res.json({ message: 'Logout endpoint' });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  // TODO: 현재 사용자 정보 반환
  res.json({ message: 'Current user endpoint' });
});

module.exports = router;
