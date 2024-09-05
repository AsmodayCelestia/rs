'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Patient.hasMany(models.MedicalRecord, { foreignKey: 'MedicalRecordId' }); 
    }
  }
  Patient.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "First name can't be null"
        },
        notEmpty: {
          msg: "First name can't be empty"
        }
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Last name can't be null"
        },
        notEmpty: {
          msg: "Last name can't be empty"
        }
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "address can't be null"
        },
        notEmpty: {
          msg: "address can't be empty"
        }
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Phone number can't be null"
        },
        notEmpty: {
          msg: "Phone Number can't be empty"
        }
      },
    },
    MedicalRecordId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        notNull: {
          msg: "MedicalRecordId can't be null",
        },
        notEmpty: {
          msg: "MedicalRecordId can't be empty",
        },
      },
    },
  }, {
    sequelize,
    modelName: 'Patient',
  });
  return Patient;
};