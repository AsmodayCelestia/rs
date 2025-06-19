'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const data = require('../db/actionRange.json').map(item => ({
      ...item,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('ActionRanges', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ActionRanges', null, {});
  }
};
