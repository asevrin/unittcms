function defineUser(sequelize, DataTypes) {
  const User = sequelize.define(
    'User',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      isApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      avatarPath: {
        type: DataTypes.STRING,
      },
    },
    { underscored: true }
  );

  User.associate = (models) => {
    User.hasMany(models.Project, { foreignKey: 'userId' });
  };

  return User;
}

export default defineUser;
