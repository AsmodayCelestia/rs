'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const data = require('../db/action.json').map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('Actions', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Actions', null, {});
  }
};
