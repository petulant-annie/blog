module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('oauthAccounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      providerUserId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: {
            tableName: 'users'
          },
          key: 'id'
        },
        allowNull: false
      },
    });
  },
  down: (queryInterface) => {
    return queryInterface.dropTable('oauthAccounts');
  }
};