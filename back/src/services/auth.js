// OAuth 및 인증 관련 서비스
const jwt = require('jsonwebtoken');
const axios = require('axios');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = require('./db');
const emailService = require('./email');

class AuthService {
  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  }

  // JWT 토큰 생성
  generateToken(userId) {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  // JWT 토큰 검증
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      return { valid: true, userId: decoded.userId };
    } catch (error) {
      return { valid: false, userId: null, error: error.message };
    }
  }

  // 사용자 조회 또는 생성 (OAuth용)
  async findOrCreateUser({ oauthProvider, oauthId, email, name, profileImage }) {
    // 기존 사용자 조회
    const existingUser = await db.query(
      'SELECT * FROM users WHERE oauth_provider = $1 AND oauth_id = $2',
      [oauthProvider, oauthId]
    );

    if (existingUser.rows.length > 0) {
      // 기존 사용자 정보 업데이트
      const updateResult = await db.query(
        `UPDATE users SET
          email = COALESCE($1, email),
          name = COALESCE($2, name),
          profile_image = COALESCE($3, profile_image),
          updated_at = NOW()
        WHERE oauth_provider = $4 AND oauth_id = $5
        RETURNING *`,
        [email, name, profileImage, oauthProvider, oauthId]
      );
      return updateResult.rows[0];
    }

    // 새 사용자 생성
    const newUser = await db.query(
      `INSERT INTO users (email, name, profile_image, oauth_provider, oauth_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [email, name, profileImage, oauthProvider, oauthId]
    );

    return newUser.rows[0];
  }

  // 사용자 ID로 조회
  async getUserById(userId) {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
  }

  // Google OAuth 토큰 검증 및 사용자 정보 조회
  async verifyGoogleToken(accessToken) {
    try {
      const response = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { sub: oauthId, email, name, picture: profileImage } = response.data;

      return {
        success: true,
        userData: { oauthProvider: 'google', oauthId, email, name, profileImage },
      };
    } catch (error) {
      console.error('Google token verification failed:', error.message);
      return { success: false, error: 'Invalid Google token' };
    }
  }

  // Kakao OAuth 토큰 검증 및 사용자 정보 조회
  async verifyKakaoToken(accessToken) {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { id: oauthId, kakao_account, properties } = response.data;
      const email = kakao_account?.email || null;
      const name = properties?.nickname || kakao_account?.profile?.nickname || '카카오 사용자';
      const profileImage = properties?.profile_image || kakao_account?.profile?.profile_image_url || null;

      return {
        success: true,
        userData: { oauthProvider: 'kakao', oauthId: String(oauthId), email, name, profileImage },
      };
    } catch (error) {
      console.error('Kakao token verification failed:', error.message);
      return { success: false, error: 'Invalid Kakao token' };
    }
  }

  // Naver OAuth 토큰 검증 및 사용자 정보 조회
  async verifyNaverToken(accessToken) {
    try {
      const response = await axios.get('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const { id: oauthId, email, name, nickname, profile_image: profileImage } = response.data.response;
      const displayName = name || nickname || '네이버 사용자';

      return {
        success: true,
        userData: { oauthProvider: 'naver', oauthId, email, name: displayName, profileImage },
      };
    } catch (error) {
      console.error('Naver token verification failed:', error.message);
      return { success: false, error: 'Invalid Naver token' };
    }
  }

  // 통합 OAuth 로그인 처리
  async handleOAuthLogin(provider, accessToken) {
    let verifyResult;

    switch (provider) {
      case 'google':
        verifyResult = await this.verifyGoogleToken(accessToken);
        break;
      case 'kakao':
        verifyResult = await this.verifyKakaoToken(accessToken);
        break;
      case 'naver':
        verifyResult = await this.verifyNaverToken(accessToken);
        break;
      default:
        return { success: false, error: 'Unsupported OAuth provider' };
    }

    if (!verifyResult.success) {
      return verifyResult;
    }

    // 사용자 생성 또는 조회
    const user = await this.findOrCreateUser(verifyResult.userData);

    // JWT 토큰 발급
    const token = this.generateToken(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profileImage: user.profile_image,
        gender: user.gender,
        type: user.type,
        partnerName: user.partner_name,
      },
      token,
    };
  }

  // 회원 탈퇴
  async deleteUser(userId) {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    return result.rows.length > 0;
  }

  // 이메일 로그인 처리
  async handleEmailLogin(email, password) {
    try {
      // 이메일로 사용자 조회
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1 AND oauth_provider IS NULL',
        [email]
      );

      if (result.rows.length === 0) {
        return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
      }

      const user = result.rows[0];

      // 비밀번호 검증
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: '이메일 또는 비밀번호가 일치하지 않습니다.' };
      }

      // JWT 토큰 발급
      const token = this.generateToken(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profile_image,
          gender: user.gender,
          type: user.type,
          partnerName: user.partner_name,
        },
        token,
      };
    } catch (error) {
      console.error('Email login failed:', error.message);
      return { success: false, error: '로그인 중 오류가 발생했습니다.' };
    }
  }

  // 이메일 회원가입 처리
  async handleEmailRegister(email, password, name, gender = null, partnerName = null) {
    try {
      // 이메일 중복 확인
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return { success: false, error: '이미 사용 중인 이메일입니다.' };
      }

      // 비밀번호 해시
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 새 사용자 생성
      // type: 생물학적 성별 (male/female)
      // gender: 역할 (husband/wife) - type에서 자동 매핑
      const genderRole = gender === 'male' ? 'husband' : 'wife';
      const newUser = await db.query(
        `INSERT INTO users (email, password_hash, name, type, gender, partner_name)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [email, passwordHash, name || email.split('@')[0], gender, genderRole, partnerName]
      );

      const user = newUser.rows[0];

      // JWT 토큰 발급
      const token = this.generateToken(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileImage: user.profile_image,
          gender: user.gender,
          type: user.type,
          partnerName: user.partner_name,
        },
        token,
      };
    } catch (error) {
      console.error('Email registration failed:', error.message);
      return { success: false, error: '회원가입 중 오류가 발생했습니다.' };
    }
  }

  // 네이버 OAuth 토큰 무효화
  async revokeNaverToken(accessToken) {
    try {
      const clientId = process.env.NAVER_CLIENT_ID;
      const clientSecret = process.env.NAVER_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        console.warn('Naver OAuth credentials not configured');
        return;
      }

      await axios.get('https://nid.naver.com/oauth2.0/token', {
        params: {
          grant_type: 'delete',
          client_id: clientId,
          client_secret: clientSecret,
          access_token: accessToken,
          service_provider: 'NAVER',
        },
      });
    } catch (error) {
      console.error('Naver token revoke failed:', error.message);
    }
  }

  // 비밀번호 변경 처리
  async handleChangePassword(userId, currentPassword, newPassword) {
    try {
      // 사용자 조회
      const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND oauth_provider IS NULL',
        [userId]
      );

      if (result.rows.length === 0) {
        return { success: false, error: '사용자를 찾을 수 없거나 소셜 로그인 사용자입니다.' };
      }

      const user = result.rows[0];

      // 현재 비밀번호 검증
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return { success: false, error: '현재 비밀번호가 일치하지 않습니다.' };
      }

      // 새 비밀번호 해시
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // 비밀번호 업데이트
      await db.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [newPasswordHash, userId]
      );

      return { success: true, message: '비밀번호가 변경되었습니다.' };
    } catch (error) {
      console.error('Password change failed:', error.message);
      return { success: false, error: '비밀번호 변경 중 오류가 발생했습니다.' };
    }
  }

  // 비밀번호 재설정 요청 (이메일 발송)
  async requestPasswordReset(email) {
    try {
      // 이메일로 사용자 조회
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1 AND oauth_provider IS NULL',
        [email]
      );

      if (result.rows.length === 0) {
        // 보안상 사용자가 없어도 성공 메시지 반환
        return { success: true, message: '이메일이 발송되었습니다.' };
      }

      const user = result.rows[0];

      // 6자리 인증 코드 생성
      const resetToken = crypto.randomInt(100000, 999999).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15분 후 만료

      // users 테이블에 토큰 저장
      await db.query(
        'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
        [resetToken, expiresAt, user.id]
      );

      // 이메일 발송
      const emailResult = await emailService.sendPasswordResetEmail(email, resetToken);
      if (!emailResult.success) {
        return { success: false, error: '이메일 발송에 실패했습니다.' };
      }

      return { success: true, message: '이메일이 발송되었습니다.' };
    } catch (error) {
      console.error('Password reset request failed:', error.message);
      return { success: false, error: '비밀번호 재설정 요청 중 오류가 발생했습니다.' };
    }
  }

  // 비밀번호 재설정 (토큰 검증 및 변경)
  async resetPassword(email, token, newPassword) {
    try {
      // 이메일로 사용자 조회 및 토큰 검증
      const userResult = await db.query(
        `SELECT * FROM users
         WHERE email = $1
         AND oauth_provider IS NULL
         AND reset_token = $2
         AND reset_token_expires_at > NOW()`,
        [email, token]
      );

      if (userResult.rows.length === 0) {
        return { success: false, error: '인증 코드가 유효하지 않거나 만료되었습니다.' };
      }

      const user = userResult.rows[0];

      // 새 비밀번호 해시
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // 비밀번호 업데이트 및 토큰 초기화
      await db.query(
        `UPDATE users
         SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL, updated_at = NOW()
         WHERE id = $2`,
        [newPasswordHash, user.id]
      );

      return { success: true, message: '비밀번호가 재설정되었습니다.' };
    } catch (error) {
      console.error('Password reset failed:', error.message);
      return { success: false, error: '비밀번호 재설정 중 오류가 발생했습니다.' };
    }
  }
}

module.exports = new AuthService();
