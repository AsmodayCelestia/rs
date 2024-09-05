'use strict';
const { hashPassword } = require('../helpers/bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = require('../db/user.json');

    const usersWithHashedPasswords = users.map(user => {
      // Remove id field to let Sequelize generate UUIDs
      delete user.id;
      console.log(user, "<<<<");
      
      // Hash the password
      user.password = hashPassword(user.password);
      
      // Set createdAt and updatedAt timestamps
      user.createdAt = new Date();
      user.updatedAt = new Date();
      
      return user;
    });

    // Insert the users into the database
    await queryInterface.bulkInsert('Users', usersWithHashedPasswords, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
