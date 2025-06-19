'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Unit extends Model {
    static associate(models) {
      Unit.hasMany(models.Action, { foreignKey: 'unitId' });
    }
  }
  Unit.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Unit name can't be empty" }
      }
    }
  }, {
    sequelize,
    modelName: 'Unit',
  });
  return Unit;
};
