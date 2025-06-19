'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const data = require('../db/unit.json').map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('Units', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Units', null, {});
  }
};
