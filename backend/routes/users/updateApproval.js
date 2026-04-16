import express from 'express';
import { DataTypes } from 'sequelize';
import defineUser from '../../models/users.js';
import authMiddleware from '../../middleware/auth.js';

const router = express.Router();

export default function (sequelize) {
  const { verifySignedIn, verifyAdmin } = authMiddleware(sequelize);
  const User = defineUser(sequelize, DataTypes);

  router.put('/:userId/approval', verifySignedIn, verifyAdmin, async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).send('userId is required');
    }

    const { isApproved } = req.body;
    if (typeof isApproved !== 'boolean') {
      return res.status(400).send('isApproved is required');
    }

    try {
      const targetUser = await User.findByPk(userId);
      if (!targetUser) {
        return res.status(404).send('User not found');
      }

      await targetUser.update({ isApproved });

      return res.json({
        user: {
          id: targetUser.id,
          email: targetUser.email,
          username: targetUser.username,
          role: targetUser.role,
          isApproved: targetUser.isApproved,
          avatarPath: targetUser.avatarPath,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
  });

  return router;
}
