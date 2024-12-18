const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file

/**
 * Returns a JSON Web Token linked to a specfic user
 * @param {Object} user - A user object which includes a username
 * @param {String} jwtSecret - Key that must correspond to JWTStrategy
 */
const generateJWTToken = (user) => {
  const payload = {
    id: user._id, // Unique ID
    userName: user.userName, // Username
  };
  return jwt.sign(payload, jwtSecret, {
    subject: user.userName, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256', // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user,
          error: error,
        });
      }

      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        const token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
