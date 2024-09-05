'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.MedicalRecord, { foreignKey: 'MedicalRecordId' }); 
    }
  }
  Transaction.init({
    doctorPrice: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Doctor Price can't be null"
        },
        notEmpty: {
          msg: "Doctor Price can't be empty"
        }
      },
    },
    medicinePrice: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Medicine Price can't be null"
        },
        notEmpty: {
          msg: "Medicine Price can't be empty"
        }
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Status can't be null"
        },
        notEmpty: {
          msg: "Status can't be empty"
        }
      },
    },
  }, {
    sequelize,
    modelName: 'Transaction',
  });
  return Transaction;
};