'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Action extends Model {
    static associate(models) {
      Action.belongsTo(models.Unit, { foreignKey: 'unitId' });
      Action.hasMany(models.ActionRange, { foreignKey: 'actionId' });
      Action.hasMany(models.Performance, { foreignKey: 'actionId' });
    }
  }
  Action.init({
    unitId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Action name can't be empty" }
      }
    },
    nilaiPerTindakan: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Action',
  });
  return Action;
};
