'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Performance extends Model {
    static associate(models) {
      Performance.belongsTo(models.User, { foreignKey: 'userId' });
      Performance.belongsTo(models.Action, { foreignKey: 'actionId' });
    }
  }
  Performance.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    actionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jumlahPasien: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Performance',
  });
  return Performance;
};
