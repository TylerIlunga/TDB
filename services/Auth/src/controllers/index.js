/** ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *  File name     :  ./controllers/Auth
 *  Purpose       :  Module for the Auth service.
 *  Author        :  Tyler Ilunga
 *  Date          :  2019-04-19
 *  Description   :  Module that holds all of the services for "Analysis".
 *                   Includes the following:
 *                   middleware()
 *                   signup()
 *                   verifyAccount()
 *                   login()
 *                   verifyResetToken()
 *                   resendEmail()
 *                   handleTFA()
 *                   forgotPassword()
 *                   resetPassword()
 *                   deleteAccount()
 *
 *  Notes         :  7
 *  Warnings      :  None
 *  Exceptions    :  N/A
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  email_service_base,
  persist_base,
  web_base,
  jwt: {
    J_SECRET
  },
} = require('../config');
const speakeasy = require('speakeasy');
const RPC = require('../../tools/Common/Network/RPC');
const Errors = require('../../tools/Common/Errors');

let tempUserObject = {};

module.exports = {
  /**
   * middleware
   * Handles verification checks for authenticated users
   */
  async middleware(req, res, next) {
    console.log('GENERIC MIDDLEWARE middleware()');
    // headers: { authorization: BEARER {JWT}, API_KEY: OHM {KEY} }
    if (
      !(
        req.headers.authorization &&
        req.headers.authorization.indexOf('BEARER') > -1
      )
    ) {
      return res.json({
        error: 'Missing JWT',
        success: false
      });
    }
    console.log('headers', req.headers);
    if (!(req.headers.api_key && req.headers.api_key.indexOf('OHM') > -1)) {
      return res.json({
        error: 'Missing key',
        success: false
      });
    }
    if (req.headers.api_key.split(' ')[1] !== API_KEY) {
      return res.json({
        error: 'Invalid key',
        success: false
      });
    }

    let token = req.headers.authorization.split(' ')[1];
    console.log('token', token);
    try {
      let decoded = await jwt.verify(token, J_SECRET);
      console.log('DECODED token::::', decoded);
      // is token expired
      if (Date.now() > decoded.exp * 1000) {
        return res.json({
          success: false,
          error: 'Session expired.'
        });
      }

      return next();
    } catch (error) {
      console.log('middleware() error', error);
      return res.json({
        error: 'Invalid session.',
        success: false
      });
    }
  },
  /**
   * signup[POST]
   * Creates an account for a user(must verify via email)
   */
  async signup(req, res) {
    if (!((req.body.email && req.body.password) || req.body.recaptchaResponse)) {
      return Errors.Network.missingFields(res);
    }
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/signup`,
        body: req.body,
        headers: null,
      })
      .then(pRes => {
        if (!pRes.success) {
          throw pRes.error;
        }
        //change 1st argument to support@puro.com
        // https://aws.amazon.com/ses/pricing/
        RPC.request({
            method: 'POST',
            url: `${email_service_base}/api/search/email/signup`,
            body: {
              user: pRes.user,
            },
            headers: null,
          })
          .then(eRes => {
            if (!eRes.success) {
              throw eRes.error;
            }
            return res.json(eRes);
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      });
  },
  /*
   * login [POST]
   * Logs a user in and checks for Two Factor Authentication (TFA)
   */
  async login(req, res) {
    if (!(req.body.email || req.body.password) && !req.body.recaptchaResponse) {
      return Errors.Network.missingFields(res);
    }
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          where: {
            email: req.body.email,
          },
          attributes: [
            'id',
            'active',
            'email',
            'password',
            'subscription',
            'two_factor_enabled',
            'two_factor_secret',
          ],
        },
        headers: null,
      })
      .then(pRes => {
        if (pRes.tfaEnabled) {
          return res.json(pRes);
        }
        let user = pRes.user;
        console.log('user::::', user);
        bcrypt.compare(req.body.password, user.password, async (error, isMatch) => {
          if (error) {
            console.log('bcrypt.compare() error', error);
            return res.json({
              error,
              success: false
            });
          }
          if (!isMatch) {
            return res.json({
              error: 'Invalid Password!',
              success: false
            });
          }
          user.password = null;
          delete user.password; // NOTE: doesn't work

          if (user.two_factor_enabled) {
            console.log('USER HAS TFA ENABLED');
            tempUserObject = user;
            console.log('tempUserObject:', tempUserObject);
            return res.json({
              tfaEnabled: true,
              success: true,
              error: false
            });
          }

          // req.session.user = user.dataValues;
          req.session.save(err => {
            if (err) {
              console.log('req.session.save() err', err);
              return res.json({
                error: 'Error creating session.',
                success: false,
              });
            }
            let token = jwt.sign({
              data: user
            }, J_SECRET, {
              expiresIn: '1d'
            });
            console.log('creating cookie for token: ', token);
            // res.signedCookie("un")
            // 1000 * 60 * 15 = 15 mins
            res.setHeader('Access-Control-Allow-Credentials', true);
            res.cookie('user_token', token, {
              maxAge: 1000 * 60 * 60,
              signed: true,
            });
            console.log('req.session', req.session);
            //NOTE: do not return or store password in token
            return res.json({
              user,
              token,
              success: true,
              tfaEnabled: false,
            });
          });
        });
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      });
  },
  /**
   * handleTFA[GET]
   * Handles Two Factor Authentication for user attempting
   * to log in.
   */
  async handleTFA(req, res) {
    // req.query.rr = recaptcha
    if (!(req.query && req.query.token && req.query.rr)) {
      return Errors.Network.missingFields(res);
    }
    console.log('tempUserObject:', tempUserObject);
    const isValidToken = speakeasy.totp.verify({
      secret: tempUserObject.two_factor_secret,
      encoding: 'ascii',
      token: req.query.token,
    });
    console.log('isValidToken', isValidToken);
    if (!isValidToken) {
      return res.json({
        error: 'Invalid token.',
        success: false
      });
    }
    req.session.save(err => {
      if (err) {
        console.log('req.session.save() err', err);
        return res.json({
          error: 'Error creating session.',
          success: false
        });
      }
      tempUserObject.password = null;
      delete tempUserObject.password;
      let token = jwt.sign({
        data: tempUserObject
      }, J_SECRET, {
        expiresIn: '1d',
      });
      console.log('creating cookie for token: ', token);
      // res.signedCookie("un")
      // 1000 * 60 * 15 = 15 mins
      res.setHeader('Access-Control-Allow-Credentials', true);
      res.cookie('user_token', token, {
        maxAge: 1000 * 60 * 15,
        signed: true,
      });
      console.log('req.session', req.session);
      res.json({
        user: tempUserObject,
        token,
        success: true
      });
      tempUserObject = null;
    });
  },
  /**
   * verifyAccount[GET]
   * Verifies and activates user's account via click on
   * sent out email link.
   */
  async verifyAccount(req, res) {
    console.log('req.query', req.query);
    if (!(req.query && req.query.token && req.query.email)) {
      return Errors.Network.missingFields(res);
    }
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          attributes: ['id'],
          where: {
            activation_token: req.query.token,
            email: req.query.email
          }
        },
        headers: null,
      }).then(qRes => {
        if (!qRes.success) {
          throw qRes.error;
        }
        let user = qRes.user;
        if (!user) {
          return res.json({
            error: 'Invalid email or token!',
            success: true
          });
        }
        RPC.request({
            method: 'POST',
            url: `${persist_base}/api/search/persist/auth/query`,
            body: {
              updatedValues: {
                active: true,
                activation_token: null
              }
            }
          }).then(uRes => {
            return res.redirect(
              `${web_base}/login?msg=${'Your acccount has been activated'}`,
            );
          })
          .catch(error => {
            throw error;
          })
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      })
  },

  /**
   * forgotPassword[POST]
   * Sends password reset link to user's stored email.
   */
  async forgotPassword(req, res) {
    if (!req.body.email) {
      return Errors.Network.missingFields(res);
    }
    const expireDate = new Date();
    // one day ahead
    expireDate.setDate(expireDate.getDate() + 1);
    // at 8 AM
    expireDate.setHours(8);
    const passwordResetToken = `${genid()}`;
    RPC.request({
        method: 'PUT',
        url: `${persist_base}/api/persist/auth/update?email=${req.body.email}`,
        body: {
          updatedValues: {
            password_reset_token: passwordResetToken,
            password_reset_expires: new Date().setTime(Date.parse(expireDate)),
          },
        },
      })
      .then(response => {
        if (!response.success) {
          throw response.error;
        }
        RPC.request({
            method: 'POST',
            url: `${email_service_base}/api/search/email/resetPassword`,
            body: {
              passwordResetToken,
              email: response.email,
            },
            headers: null,
          })
          .then(eRes => {
            if (!eRes.success) {
              throw eRes.error;
            }
            return res.json(eRes);
          })
          .catch(error => {
            throw error;
          });
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      });
  },
  /**
   * verifyResetToken[GET]
   * Verfies the account reset token we set and send out
   * to user's via email when they need to reset their
   * account. Redirects user back to password reset view.
   */
  async verifyResetToken(req, res) {
    if (!(req.query && req.query.token && req.query.email)) {
      return Errors.Network.missingFields(res);
    }
    const {
      token,
      email
    } = req.query;
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          attributes: ['id'],
          where: {
            password_reset_token: token,
            email
          }
        },
        headers: null,
      }).then(response => {
        if (!response.success) throw response.error;
        // TODO: handle if is token expired
        // if(Date.now() > user.password_reset_expires * 1000) {
        //   return res.json({ error: 'Token expired.', success: false });
        // }
        // return res.json({ success: true, error: null });
        return res.redirect(`${web_base}/reset?&email=${email}&token=${token}`);
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      })

  },
  /**
   * resetPassword[POST]
   * Resets user password.
   */
  async resetPassword(req, res) {
    // NOTE: Handle confirmPassword value on FE && old password equaling newPassword.
    if (
      !(req.body && req.body.email && req.body.newPassword && req.body.token)
    ) {
      return Errors.Network.missingFields(res);
    }
    const {
      email,
      newPassword,
      token
    } = req.body;
    console.log(email, newPassword, token);
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          attributes: ['id', 'password'],
          where: {
            email: email,
            password_reset_token: token
          }
        },
        headers: null,
      }).then(async response => {
        if (!response.success) throw response.error;
        // TODO: handle if is token expired
        // if(Date.now() > currentUser.password_reset_expires * 1000) {
        //   return res.json({ error: 'Token expired.', success: false });
        // }
        let currentUser = response.user;
        let storedPassword = await genPassword(newPassword);
        console.log(`storedPassword:\n${storedPassword}`);
        bcrypt.compare(
          newPassword,
          currentUser.password,
          async (error, isMatch) => {
            if (error) {
              return res.json({
                error,
                success: false
              });
            }
            if (isMatch) {
              return res.json({
                error: 'This password is on file!',
                success: false,
              });
            }

            RPC.request({
                method: 'PUT',
                url: `${persist_base}/api/persist/auth/update?email=${email}`,
                body: {
                  updatedValues: {
                    password: storedPassword,
                    password_reset_expires: null,
                    password_reset_token: null,
                  },
                },
              })
              .then(response => {
                if (!response.success) throw response.error;
                return res.json({
                  success: true,
                  error: null
                });
              })
              .catch(error => {
                throw error;
              })
          },
        );
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      })
  },
  /**
   * logout[GET]
   * Logs user out.
   */
  logout(req, res) {
    console.log('req.session', req.session);
    if (!req.session) {
      return res.json({
        session: false
      });
    }
    req.session.destroy();
    res.clearCookie('p_sid');
    res.clearCookie('user_token');
    console.log('session destroyed!');
    console.log(req.session);
    res.json({
      success: true
    });
  },
  /**
   * deleteAccount[DELETE]
   * Deletes user's account information.
   */
  async deleteAccount(req, res) {
    if (!(req.query && req.query.id && req.query.email && req.body.password)) {
      return Errors.Network.missingFields(res);
    }

    const {
      id,
      email
    } = req.query;
    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          attributes: ['id', 'password'],
          where: {
            id: id,
            email: email
          }
        },
        headers: null,
      }).then(qRes => {
        if (!qRes.success) throw qRes.error;
        let currentUser = qRes.user;
        bcrypt.compare(req.body.password, currentUser.password, (error, isMatch) => {
          if (error) {
            return res.json({
              error,
              success: false
            });
          }
          if (!isMatch) {
            return res.json({
              error: 'Old Password is invalid!',
              success: false
            });
          }

          RPC.request({
              method: 'POST',
              url: `${persist_base}/api/search/persist/auth/delete?id=${currentUser.id}`,
              body: {
                attributes: ['id', 'password'],
                where: {
                  id: id,
                  email: email
                }
              },
              headers: null,
            }).then(dRes => {
              if (!dRes.success) throw dRes.error;
              req.session.destroy();
              res.clearCookie('user_token');
              console.log('session destroyed!');
              console.log('req.session:::', req.session);
              return res.json({
                success: true
              });
            })
            .catch(error => {
              throw error;
            })
        });
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      })
  },
  /**
   * resendEmail[GET]
   * Resends activation email to user's who created an account
   * but did not verify and activate.
   */
  async resendEmail(req, res) {
    if (!(req.query && req.query.email)) {
      return Errors.Network.missingFields(res);
    }

    RPC.request({
        method: 'POST',
        url: `${persist_base}/api/search/persist/auth/query`,
        body: {
          attributes: ['activation_token', 'email'],
          where: {
            email: req.query.email
          }
        },
        headers: null,
      }).then(qRes => {
        if (!qRes.success) throw qRes.error;
        const user = qRes.user;
        console.log(`user: ${JSON.stringify(user, null, 2)}`);
        if (!user.activation_token) {
          return res.json({
            error: 'Account does not exist!',
            success: false
          });
        }
        RPC.request({
            method: 'POST',
            url: `${email_service_base}/api/search/email/resend`,
            body: {
              user,
            },
            headers: null,
          }).then(eRes => {
            if (!eRes.success) throw eRes.error;
            console.log('email sent!');
            return res.json({
              success: true,
              error: false
            });
          })
          .catch(error => {
            throw error;
          })
      })
      .catch(error => {
        return Errors.Network.rpcFailure('Persist', error, res);
      })
  },
};