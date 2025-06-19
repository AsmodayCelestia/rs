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

  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!email || !password || !role) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      const user = await User.create({ name, email, password, role });
      res.status(201).json({ message: 'User registered', id: user.id });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === KARYAWAN - INPUT TINDAKAN ===
  static async inputReward(req, res) {
    try {
      const { actionId, jumlahPasien, tanggal } = req.body;
      const userId = req.user.id;
  
      console.log('[1] Input:', { userId, actionId, jumlahPasien, tanggal });
  
      // Ambil action beserta Unit dan Range
      const action = await Action.findByPk(actionId, {
        include: [Unit, ActionRange]
      });
  
      if (!action) throw { name: 'ActionNotFound' };
      console.log('[2] Action:', {
        id: action.id,
        name: action.name,
        nilaiPerTindakan: action.nilaiPerTindakan,
        unit: action.Unit?.name,
        ranges: action.ActionRanges?.length
      });
  
      const nilaiPerTindakan = action.nilaiPerTindakan;
  
      // Hitung pengali
      let pengali = 0;
      for (let range of action.ActionRanges) {
        console.log('[3] Cek range:', range.minValue, '-', range.maxValue, '->', range.pengali);
        if (jumlahPasien >= range.minValue && jumlahPasien <= range.maxValue) {
          pengali = range.pengali;
          break;
        }
      }
      console.log('[4] Pengali:', pengali);
  
      const subtotal = pengali * nilaiPerTindakan;
      console.log('[5] Subtotal:', subtotal);
  
      // Simpan ke Performance
      const performance = await Performance.create({ userId, actionId, jumlahPasien, tanggal });
      console.log('[6] Saved performance ID:', performance.id);
  
      // Update atau buat reward log
      const [rewardLog, created] = await RewardLog.findOrCreate({
        where: { userId, tanggal },
        defaults: { totalReward: subtotal }
      });
  
      if (!created) {
        rewardLog.totalReward = Number(rewardLog.totalReward) + Number(subtotal);
        await rewardLog.save();
      }
      
  
      res.status(201).json({
        message: 'Reward calculated & saved',
        tanggal,
        unit: action.Unit?.name || '-',
        tindakan: action.name,
        jumlahPasien,
        pengali,
        nilaiPerTindakan,
        subtotal,
        totalReward: rewardLog.totalReward,
        performanceId: performance.id
      });
    } catch (error) {
      console.log('[ERROR]', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }


  static async myRewards(req, res) {
    try {
      const userId = req.user.id;
      const performances = await Performance.findAll({
        where: { userId },
        include: [
          {
            model: Action,
            include: [Unit, ActionRange]
          }
        ],
        order: [['tanggal', 'ASC']]
      });

      const result = performances.map(perf => {
        const action = perf.Action;
        const ranges = action.ActionRanges;
        let pengali = 0;
        for (let range of ranges) {
          if (perf.jumlahPasien >= range.minValue && perf.jumlahPasien <= range.maxValue) {
            pengali = range.pengali;
            break;
          }
        }
        const nilaiPerTindakan = action.nilaiPerTindakan;
        const subtotal = pengali * nilaiPerTindakan;
        return {
          tanggal: perf.tanggal,
          unit: action.Unit.name,
          tindakan: action.name,
          jumlahPasien: perf.jumlahPasien,
          pengali,
          nilaiPerTindakan,
          subtotal
        };
      });

      res.status(200).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - LIHAT REWARD PER USER ===
  static async rewardsByUserId(req, res) {
    try {
      const { id } = req.params;
      const performances = await Performance.findAll({
        where: { userId: id },
        include: [{ model: Action, include: [Unit, ActionRange] }],
        order: [['tanggal', 'ASC']]
      });
  
      const result = performances.map(perf => {
        const action = perf.Action;
        const ranges = action.ActionRanges;
        let pengali = 0;
        for (let range of ranges) {
          if (perf.jumlahPasien >= range.minValue && perf.jumlahPasien <= range.maxValue) {
            pengali = range.pengali;
            break;
          }
        }
        const nilaiPerTindakan = action.nilaiPerTindakan;
        const subtotal = pengali * nilaiPerTindakan;
        return {
          performanceId: perf.id,
          tanggal: perf.tanggal,
          unit: action.Unit.name,
          tindakan: action.name,
          jumlahPasien: perf.jumlahPasien,
          pengali,
          nilaiPerTindakan,
          subtotal
        };
      });
  
      res.status(200).json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  // === ADMIN - UPDATE PERFORMANCE DATA ===
  static async updateUserReward(req, res) {
    try {
      const { id, performanceId } = req.params;
      const { jumlahPasien, tanggal } = req.body;
  
      const performance = await Performance.findOne({ where: { id: performanceId, userId: id } });
      if (!performance) return res.status(404).json({ message: 'Performance not found' });
  
      await performance.update({ jumlahPasien, tanggal });
  
      res.status(200).json({ message: 'Performance updated' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  // === ADMIN - DELETE PERFORMANCE DATA ===
  static async deleteUserReward(req, res) {
    try {
      const { id, performanceId } = req.params;
      const performance = await Performance.findOne({ where: { id: performanceId, userId: id } });
      if (!performance) return res.status(404).json({ message: 'Performance not found' });
  
      await performance.destroy();
      res.status(200).json({ message: 'Performance deleted' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
  // controller.js
  static async myPerformance(req, res) {
    try {
      const performances = await Performance.findAll({
        where: { userId: req.user.id },
        include: [
          {
            model: Action,
            include: [Unit, ActionRange]
          }
        ],
        order: [['tanggal', 'ASC']]
      });
  
      const result = performances.map(p => {
        const action = p.Action;
        const unit = action.Unit;
        const range = action.ActionRanges.find(r =>
          p.jumlahPasien >= r.minValue && p.jumlahPasien <= r.maxValue
        );
        const pengali = range ? range.pengali : 0;
        const nilai = action.nilaiPerTindakan || 0;
        const subtotal = pengali * nilai;
  
        return {
          tanggal: p.tanggal,
          tindakan: action.name,
          unit: unit.name,
          jumlahPasien: p.jumlahPasien,
          pengali,
          nilaiPerTindakan: nilai,
          subtotal
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async performanceByUserId(req, res) {
    try {
      const userId = req.params.id;
  
      const performances = await Performance.findAll({
        where: { userId },
        include: [
          {
            model: Action,
            include: [Unit, ActionRange]
          }
        ],
        order: [['tanggal', 'ASC']]
      });
  
      const result = performances.map(p => {
        const action = p.Action;
        const unit = action.Unit;
        const range = action.ActionRanges.find(r =>
          p.jumlahPasien >= r.minValue && p.jumlahPasien <= r.maxValue
        );
        const pengali = range ? range.pengali : 0;
        const nilai = action.nilaiPerTindakan || 0;
        const subtotal = pengali * nilai;
  
        return {
          tanggal: p.tanggal,
          tindakan: action.name,
          unit: unit.name,
          jumlahPasien: p.jumlahPasien,
          pengali,
          nilaiPerTindakan: nilai,
          subtotal
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error('performanceByUserId error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }  
  
  // === ADMIN - UNIT CRUD ===
  static async createUnit(req, res) {
    try {
      const { name } = req.body;
      const unit = await Unit.create({ name });
      res.status(201).json(unit);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getUnits(req, res) {
    try {
      const units = await Unit.findAll();
      res.status(200).json(units);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getUnitById(req, res) {
    try {
      const unit = await Unit.findByPk(req.params.id);
      if (!unit) return res.status(404).json({ message: 'Unit not found' });
      res.status(200).json(unit);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateUnit(req, res) {
    try {
      const { name } = req.body;
      const unit = await Unit.findByPk(req.params.id);
      if (!unit) return res.status(404).json({ message: 'Unit not found' });
      await unit.update({ name });
      res.status(200).json({ message: 'Unit updated' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteUnit(req, res) {
    try {
      const unit = await Unit.findByPk(req.params.id);
      if (!unit) return res.status(404).json({ message: 'Unit not found' });
      await unit.destroy();
      res.status(200).json({ message: 'Unit deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - ACTION CRUD ===
  static async createAction(req, res) {
    try {
      const { name, unitId, nilaiPerTindakan } = req.body;
      const action = await Action.create({ name, unitId, nilaiPerTindakan });
      res.status(201).json(action);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getActions(req, res) {
    try {
      const actions = await Action.findAll();
      res.status(200).json(actions);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getActionById(req, res) {
    try {
      const action = await Action.findByPk(req.params.id);
      if (!action) return res.status(404).json({ message: 'Action not found' });
      res.status(200).json(action);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateAction(req, res) {
    try {
      const { name, unitId, nilaiPerTindakan } = req.body;
      const action = await Action.findByPk(req.params.id);
      if (!action) return res.status(404).json({ message: 'Action not found' });
      await action.update({ name, unitId, nilaiPerTindakan });
      res.status(200).json({ message: 'Action updated' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteAction(req, res) {
    try {
      const action = await Action.findByPk(req.params.id);
      if (!action) return res.status(404).json({ message: 'Action not found' });
      await action.destroy();
      res.status(200).json({ message: 'Action deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  // === ADMIN - RANGE CRUD ===
  static async createRange(req, res) {
    try {
      const { actionId, minValue, maxValue, pengali } = req.body;
      const range = await ActionRange.create({ actionId, minValue, maxValue, pengali });
      res.status(201).json(range);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getRanges(req, res) {
    try {
      const ranges = await ActionRange.findAll();
      res.status(200).json(ranges);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async getRangeById(req, res) {
    try {
      const range = await ActionRange.findByPk(req.params.id);
      if (!range) return res.status(404).json({ message: 'Range not found' });
      res.status(200).json(range);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async updateRange(req, res) {
    try {
      const { actionId, minValue, maxValue, pengali } = req.body;
      const range = await ActionRange.findByPk(req.params.id);
      if (!range) return res.status(404).json({ message: 'Range not found' });
      await range.update({ actionId, minValue, maxValue, pengali });
      res.status(200).json({ message: 'Range updated' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async deleteRange(req, res) {
    try {
      const range = await ActionRange.findByPk(req.params.id);
      if (!range) return res.status(404).json({ message: 'Range not found' });
      await range.destroy();
      res.status(200).json({ message: 'Range deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static async allRewards(req, res) {
    try {
      const performances = await Performance.findAll({
        include: [
          {
            model: Action,
            include: [Unit, ActionRange] 
          },
          {
            model: User,
            attributes: ['name', 'email']
          }
        ],
        order: [['tanggal', 'ASC']]
      });
  
      const result = performances.map(p => {
        const action = p.Action;
        const unit = action.Unit;
        const range = action.ActionRanges?.find(r =>
          p.jumlahPasien >= r.minValue && p.jumlahPasien <= r.maxValue
        );
        const pengali = range?.pengali || 0;
        const nilai = action.nilaiPerTindakan || 0;
        const subtotal = pengali * nilai;
  
        return {
          tanggal: p.tanggal,
          totalReward: subtotal,
          User: p.User,
          Action: {
            name: action.name,
            nilaiPerTindakan: nilai,
            unit: unit?.name || '-'
          }
        };
      });
  
      res.status(200).json(result);
    } catch (error) {
      console.error('allRewards error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
  
}
  

module.exports = Controller;