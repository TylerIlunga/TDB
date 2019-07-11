const bcrypt = require('bcrypt');
const {
  getClient,
  genid,
  genPassword,
  User,
} = require('../../config');
const Errors = require('../../../tools/Common/Errors');
const Sequelize = getClient();
// const Op = Sequelize.Op;

module.exports = {
  async signup(req, res) {
    let {
      email,
      password,
      recaptchaResponse
    } = req.body;
    const user = await User.findOne({
      where: {
        email
      }
    });
    if (user) return res.json({
      error: 'User exists.',
      success: false
    });

    console.log('oldPassword', password);
    password = await genPassword(password);
    console.log('newPassword', password);

    const trial_expires = new Date();
    // seven days ahead
    trial_expires.setDate(trial_expires.getDate() + 7);
    // at 8 AM
    trial_expires.setHours(8);

    User.create({
        password,
        subscription: 'free',
        email: email.trim(),
        trial_expires: new Date().setTime(Date.parse(trial_expires)),
        activation_token: genid(),
        type: 'user',
      })
      .then(user => {
        console.log('storedUser:', user);
        user = user.dataValues;
        return res.json({
          success: true,
          user
        });
      })
      .catch(error => {
        console.log('User.create() error', error);
        return res.json({
          error: 'Error saving user.' + error,
          success: false
        });
      });
  },
  async query(req, res) {
    if (!(req.body && req.body.attributes && req.body.where)) {
      return Errors.Network.missingFields(res);
    }
    // TODO: Handle list all[quick fix, lazy now]
    const user = await User.findOne({
      attributes: req.body.attributes,
      where: req.body.where,
    });
    if (!user) {
      return res.json({
        error: "Account doesn't exists.",
        success: false
      });
    }
    // NOTE: handled at Auth Service level.
    // if (!user.active) {
    //   return res.json({
    //     error: 'Activate your account!',
    //     success: false
    //   });
    // }
    return res.json({
      user,
      success: true
    });
  },
  async update(req, res) {
    if (!(req.query && req.query.email && req.body.updatedValues)) {
      return Errors.Network.missingFields(res);
    }
    const {
      email
    } = req.body;
    const user = await User.findOne({
      where: {
        email
      }
    });
    if (!user) {
      return res.json({
        error: 'Account does not exist!',
        success: false
      });
    }
    console.log('user', user);
    user
      .update(req.body.updatedValues)
      .then(result => {
        console.log('update result:', result);
        result = result.dataValues;
        return res.json({
          success: true,
          email: user.email
        });
      })
      .catch(error => {
        console.log('user.update() error', error);
        return res.json({
          error: 'Error updating account: ' + error,
          success: false,
        });
      });
  },
  async delete(req, res) {
    if (!(req.query && req.query.id)) {
      return Errors.Network.missingFields(res);
    }
    const user = await User.findOne({
      attributes: ['id'],
      where: req.query.id,
    });
    if (!user) {
      return res.json({
        error: "Account doesn't exists.",
        success: false
      });
    }
    user
      .destroy()
      .then(result => {
        return res.json({
          success: true,
          error: null
        });
      })
      .catch(error => {
        console.log('currentUser.destroy() error', error);
        return res.json({
          error: 'Error deleting account, please contact support@puro.com',
          success: false,
        });
      });
  },
};