'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RewardLog extends Model {
    static associate(models) {
      RewardLog.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  RewardLog.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    totalReward: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'RewardLog',
  });
  return RewardLog;
};
