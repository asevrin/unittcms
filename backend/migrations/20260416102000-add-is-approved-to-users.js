export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('users', 'is_approved', {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.sequelize.query(`
    UPDATE users
    SET is_approved = 1
    WHERE role = 0
  `);
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('users', 'is_approved');
}
