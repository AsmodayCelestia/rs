const { User, Unit, Action, ActionRange, Performance, RewardLog } = require('../models');
const { comparePassword } = require('../helpers/bcrypt');
const { signToken } = require('../helpers/jwt');
const { Op } = require('sequelize');

class Controller {
  // === LOGIN ===
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) throw { name: 'Email/Password required' };

      const user = await User.findOne({ where: { email } });
      if (!user || !comparePassword(password, user.password)) {
        return res.status(401).json({ message: 'Invalid email/password' });
      }

      const access_token = signToken({ id: user.id });
      res.status(200).json({
        Authorization: `Bearer ${access_token}`,
        role: user.role,
        email: user.email
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === KARYAWAN - INPUT TINDAKAN ===
  static async inputReward(req, res) {
    try {
      const { actionId, jumlahPasien, tanggal } = req.body;
      const userId = req.user.id;

      const action = await Action.findByPk(actionId);
      if (!action) throw { name: 'ActionNotFound' };

      const range = await ActionRange.findOne({
        where: {
          actionId,
          minValue: { [Op.lte]: jumlahPasien },
          maxValue: { [Op.gte]: jumlahPasien }
        }
      });

      const pengali = range ? range.pengali : 0;
      const nilaiTindakan = action.nilaiPerTindakan;
      const subtotal = pengali * nilaiTindakan;

      await Performance.create({ userId, actionId, jumlahPasien, tanggal });

      const [rewardLog, created] = await RewardLog.findOrCreate({
        where: { userId, tanggal },
        defaults: { totalReward: subtotal }
      });

      if (!created) {
        rewardLog.totalReward += subtotal;
        await rewardLog.save();
      }

      res.status(201).json({
        message: 'Reward calculated & saved',
        pengali,
        nilaiTindakan,
        subtotal,
        totalReward: rewardLog.totalReward
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === KARYAWAN - LIHAT REWARD PRIBADI ===
  static async myRewards(req, res) {
    try {
      const userId = req.user.id;
      const logs = await RewardLog.findAll({
        where: { userId },
        order: [['tanggal', 'ASC']]
      });
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - CREATE UNIT ===
  static async createUnit(req, res) {
    try {
      const { name } = req.body;
      const unit = await Unit.create({ name });
      res.status(201).json(unit);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - CREATE ACTION ===
  static async createAction(req, res) {
    try {
      const { name, unitId, nilaiPerTindakan } = req.body;
      const action = await Action.create({ name, unitId, nilaiPerTindakan });
      res.status(201).json(action);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - CREATE RANGE (pengali) ===
  static async createRange(req, res) {
    try {
      const { actionId, minValue, maxValue, pengali } = req.body;
      const range = await ActionRange.create({ actionId, minValue, maxValue, pengali });
      res.status(201).json(range);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - LIHAT SEMUA CAPAIAN ===
  static async allRewards(req, res) {
    try {
      const logs = await RewardLog.findAll({
        include: [{ model: User, attributes: ['name', 'email'] }],
        order: [['tanggal', 'ASC']]
      });
      res.status(200).json(logs);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}

module.exports = Controller;
