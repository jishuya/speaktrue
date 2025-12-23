const express = require('express');
const router = express.Router();
const db = require('../services/db');

// GET /api/user/profile - 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    // TODO: 실제 인증 구현 후 req.user.id 사용
    const userId = req.query.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const query = `
      SELECT id, name, email, gender, type, partner_name, created_at, updated_at
      FROM users
      WHERE id = $1
    `;

    const result = await db.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      type: user.type,
      partnerName: user.partner_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: '프로필을 불러오는데 실패했습니다' });
  }
});

// PATCH /api/user/profile - 프로필 수정
router.patch('/profile', async (req, res) => {
  try {
    // TODO: 실제 인증 구현 후 req.user.id 사용
    const userId = req.body.userId || req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'userId가 필요합니다' });
    }

    const { name, email, gender, type, partnerName } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: '이름은 필수입니다' });
    }

    const query = `
      UPDATE users
      SET name = $1, email = $2, gender = $3, type = $4, partner_name = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, name, email, gender, type, partner_name, created_at, updated_at
    `;

    const result = await db.query(query, [
      name.trim(),
      email?.trim() || null,
      gender || null,
      type || null,
      partnerName?.trim() || null,
      userId,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      gender: user.gender,
      type: user.type,
      partnerName: user.partner_name,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: '프로필 수정에 실패했습니다' });
  }
});

module.exports = router;
