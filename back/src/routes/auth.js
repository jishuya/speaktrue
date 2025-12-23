const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const { authenticate, asyncHandler } = require('../middlewares');

// POST /api/auth/google - 구글 OAuth 로그인
router.post('/google', asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const result = await authService.handleOAuthLogin('google', accessToken);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    message: 'Google 로그인 성공',
    user: result.user,
    token: result.token,
  });
}));

// POST /api/auth/kakao - 카카오 OAuth 로그인
router.post('/kakao', asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const result = await authService.handleOAuthLogin('kakao', accessToken);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    message: '카카오 로그인 성공',
    user: result.user,
    token: result.token,
  });
}));

// POST /api/auth/naver - 네이버 OAuth 로그인
router.post('/naver', asyncHandler(async (req, res) => {
  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: 'Access token is required' });
  }

  const result = await authService.handleOAuthLogin('naver', accessToken);

  if (!result.success) {
    return res.status(401).json({ error: result.error });
  }

  res.json({
    message: '네이버 로그인 성공',
    user: result.user,
    token: result.token,
  });
}));

// POST /api/auth/logout - 로그아웃
router.post('/logout', authenticate, asyncHandler(async (req, res) => {
  // JWT 기반 인증이므로 클라이언트에서 토큰 삭제로 처리
  // 필요 시 토큰 블랙리스트 구현 가능
  res.json({ message: '로그아웃 성공' });
}));

// GET /api/auth/me - 현재 사용자 정보 조회
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  res.json({
    user: req.user,
  });
}));

// DELETE /api/auth/withdraw - 회원 탈퇴
router.delete('/withdraw', authenticate, asyncHandler(async (req, res) => {
  const deleted = await authService.deleteUser(req.user.id);

  if (!deleted) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  res.json({ message: '회원 탈퇴가 완료되었습니다.' });
}));

// POST /api/auth/refresh - 토큰 갱신 (선택사항)
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  const newToken = authService.generateToken(req.user.id);

  res.json({
    message: '토큰 갱신 성공',
    token: newToken,
  });
}));

module.exports = router;
