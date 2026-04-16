import express from 'express';
const router = express.Router();
import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import defineUser from '../../models/users.js';
import { roles, defaultDangerKey } from './authSettings.js';

export default function (sequelize) {
  const User = defineUser(sequelize, DataTypes);
  const secretKey = process.env.SECRET_KEY || defaultDangerKey;

  router.post('/signup', async (req, res) => {
    try {
      const { email, password, username } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);

      const userCount = await User.count();
      const isDemoMode = process.env.IS_DEMO === 'true' || process.env.IS_DEMO === '1';
      const isFirstUser = userCount === 0;
      const initialRole =
        userCount > 0
          ? roles.findIndex((entry) => entry.uid === 'user')
          : roles.findIndex((entry) => entry.uid === 'administrator');
      const isApproved = isFirstUser || isDemoMode;

      const user = await User.create({
        email,
        password: hashedPassword,
        username: username,
        role: initialRole,
        isApproved,
      });

      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isApproved: user.isApproved,
        avatarPath: user.avatarPath,
      };

      if (!isApproved) {
        return res.status(201).json({
          requiresApproval: true,
          user: safeUser,
        });
      }

      const accessToken = jwt.sign({ userId: user.id }, secretKey, {
        expiresIn: '24h',
      });
      const expiresAt = Date.now() + 3600 * 1000 * 24;

      return res.status(200).json({
        requiresApproval: false,
        access_token: accessToken,
        expires_at: expiresAt,
        user: safeUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Sign up failed');
    }
  });

  return router;
}
