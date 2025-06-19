// middlewares/authentication.js
const { verifyToken } = require('../helpers/jwt');
const { User } = require('../models');

async function authentication(req, res, next) {
  try {
    let bearerToken =
      req.headers.authorization || req.body.headers?.Authorization;
    if (!bearerToken) throw { name: 'Invalid Token' };

    const token = bearerToken.split(' ')[1];
    const decoded = verifyToken(token);
    const findUser = await User.findByPk(decoded.id);
    if (!findUser) throw { name: 'Invalid Token' };

    req.user = {
      id: findUser.id,
      email: findUser.email,
      role: findUser.role, // << biar bisa dipakai di authorization
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { authentication };
