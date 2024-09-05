'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MedicalRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MedicalRecord.belongsTo(models.Patient, { foreignKey: 'MedicalRecordId' }); 
      MedicalRecord.hasMany(models.Transaction, { foreignKey: 'TransactionId' }); 
    }
  }
  MedicalRecord.init({
    keluhan: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Keluhan can't be null"
        },
        notEmpty: {
          msg: "Keluhan can't be empty"
        }
      },
    },
    DoctorCheckResult: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Doctor Check Result can't be null"
        },
        notEmpty: {
          msg: "Doctor Check Result can't be empty"
        }
      },
    },
    Recipe: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Recipe can't be null"
        },
        notEmpty: {
          msg: "Recipe can't be empty"
        }
      },
    },
    PatientId: {
      allowNull: false,
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      validate: {
        notNull: {
          msg: "PatientId can't be null",
        },
        notEmpty: {
          msg: "PatientId can't be empty",
        },
      },
    },
  }, {
    sequelize,
    modelName: 'MedicalRecord',
  });
  return MedicalRecord;
};