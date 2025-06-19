'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ActionRange extends Model {
    static associate(models) {
      ActionRange.belongsTo(models.Action, { foreignKey: 'actionId' });
    }
  }
  ActionRange.init({
    actionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minValue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    maxValue: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pengali: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'ActionRange',
  });
  return ActionRange;
};
