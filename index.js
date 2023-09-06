const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');

// Models
const Movies = Models.Movie;
const Users = Models.User;

// mongoose.connect('mongodb://localhost:27017/myFlix', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

mongoose.connect(
  'mongodb+srv://myFlixDBAdmin:RamizRocks@myflixdb.javx9xm.mongodb.net/myFlixDB?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const express = require('express');
const morgan = require('morgan');
const { reduce, update } = require('lodash');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('common'));

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// Get a list of all movies
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Get a list of all users
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.find()
      // Don't show password
      .select('userName userEmail favoriteMovies')
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Return data about a single movie by title
app.get(
  '/movies/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ movieTitle: req.params.movieTitle })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Return data about a genre by genre name
app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'Genre.name': `${req.params.genreName}` })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Return data about a director by name
app.get(
  '/movies/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Movies.findOne({ 'Director.name': `${req.params.directorName}` })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Allow new users to register
app.post(
  '/users',
  [
    check('userName', 'Username is required').isLength({ min: 5 }),
    check(
      'userName',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('userEmail', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.userName + ' already exists');
        } else {
          Users.create({
            userName: req.body.userName,
            password: hashedPassword,
            userEmail: req.body.userEmail,
            userBirthDate: req.body.BirthDate,
          })
            .then((user) => {
              res.status(201).send('New user Created Successfully');
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error here: ' + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  }
);

// Allow  users to update their user info by user name
app.put(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  [
    check('userName', 'Username is required').isLength({ min: 5 }),
    check(
      'userName',
      'Username contains non alphanumeric characters - not allowed.'
    ).isAlphanumeric(),
    check('password', 'Password is required').not().isEmpty(),
    check('userEmail', 'Email does not appear to be valid').isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // prevent logged-in users from modifying other user data
    if (req.user.userName !== req.params.userName) {
      return res.status(400).send('Permission denied');
    }

    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $set: {
          userName: req.body.userName,
          password: req.body.password,
          userEmail: req.body.userEmail,
          userBirthDate: req.body.BirthDate,
        },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Allow  users to add a movie to their list of favorites
app.post(
  '/users/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $push: { favoriteMovies: req.params.movieId },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Allow  users to remove a movie from their list of favorites
app.delete(
  '/users/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $pull: { favoriteMovies: req.params.movieId },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

// Allow  users to deregister
app.delete(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    await Users.findOneAndDelete({
      userName: req.params.userName,
    })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.userName + ' was not found');
        } else {
          res
            .status(200)
            .send(req.params.userName + ' was succesfully deleted');
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

app.get('/', (req, res) => {
  res.send("It's hot today again, eat some icecream");
});

// Log requests to server on the terminal
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send('Something went wrong');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
