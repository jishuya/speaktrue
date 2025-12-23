// 인증 미들웨어
const authService = require('../services/auth');

// JWT 토큰 검증 미들웨어
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '인증 토큰이 필요합니다.' });
    }

    const token = authHeader.split(' ')[1];
    const { valid, userId, error } = authService.verifyToken(token);

    if (!valid) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.', details: error });
    }

    // 사용자 정보 조회
    const user = await authService.getUserById(userId);

    if (!user) {
      return res.status(401).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 요청 객체에 사용자 정보 첨부
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      profileImage: user.profile_image,
      gender: user.gender,
      type: user.type,
      partnerName: user.partner_name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: '인증 처리 중 오류가 발생했습니다.' });
  }
};

// 선택적 인증 미들웨어 (로그인 안 해도 진행 가능)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const { valid, userId } = authService.verifyToken(token);

    if (valid && userId) {
      const user = await authService.getUserById(userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profile_image,
          gender: user.gender,
          type: user.type,
          partnerName: user.partner_name,
        };
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuth,
};
