require('dotenv').config();

// Start - code added from 2.4
const {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
} = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: 'eu-central-1',
  // endpoint: ,
  // forcePathStyle: true,
});

// const AWS = require('aws-sdk');

// Set the region
// AWS.config.update({ region: 'eu-central-1' });

// Create S3 service object
// let s3 = new AWS.S3({ apiVersion: '2006-03-01' });

// Create S3 service objec

// End List object in bucket

//  upload object to a bucket // ------------------

// // call S3 to retrieve upload file to specified bucket
// var uploadParams = { Bucket: process.argv[2], Key: '', Body: '' };
// var file = process.argv[3];

// // Configure the file stream and obtain the upload parameters
// const fs = require('fs');
// // const fileUpload = require('express-fileupload');
// const fileStream = fs.createReadStream(file);
// fileStream.on('error', function (err) {
//   console.log('file error', err);
// });
// uploadParams.Body = fileStream;
// const path = require('path');
// uploadParams.Key = path.basename(file);
// // call S3 to retrieve upload file to specified bucket
// s3.upload(uploadParams, function (err, data) {
//   if (err) {
//     console.log('Error', err);
//   }
//   if (data) {
//     console.log('Upload Success', data.Location);
//   }
// });

// End - code added from 2.4

const mongoose = require('mongoose');
const Models = require('./models.js');
const { check, validationResult } = require('express-validator');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

// Models
const Movies = Models.Movie;
const Users = Models.User;

async function connectToDb() {
  try {
    await mongoose.connect(process.env.CONNECTION_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch {
    (err) => {
      console.log(err.message);
    };
  }
}

connectToDb();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan('common'));

app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

/**
 * @description Get all available movies
 * @name GET /movies
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 * [
 *  {
 *    _id: ObjectID,
 *    movieId: "",
 *    movieTitle: "",
 *    description: "",
 *    Genre: {name: "", description: ""},
 *    Director: {name: "", bio: "", birthDay: Date Object},
 *    imagePath: "",
 *    featured: Boolean
 *  },
 *  ...
 * ]
 */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error: ' + error);
    }
  }
);

/**
 * @description Get a single user
 * @name GET /users/:id
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 *  {
 *    _id: ObjectID,
 *    userId: "",
 *    userName: "",
 *    password: "",
 *    userEmail: "",
 *    userBirthDate: Date Object,
 *    favoriteMovies: [ObjectID, ...]
 *  }
 */
app.get(
  '/users/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ _id: req.params.id });
      res.status(200).json(user);
    } catch (error) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

/**
 * @description Get all available users
 * @name GET /users
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 * [
 *   {
 *    userName: "",
 *    userEmail: "",
 *    favoriteMovies: [ObjectID, ...]
 *    userBirthDate: Date Object,
 *    password: "",
 *   }, ...
 *  ]
 */
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find().select(
        'userName userEmail favoriteMovies userBirthDate  password'
      );
      res.status(200).json(users);
    } catch (error) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

/**
 * @description Get data about a single movie by title
 * @name GET /movies/:movieTitle
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 *  {
 *    _id: ObjectID,
 *    movieId: "",
 *    movieTitle: "",
 *    description: "",
 *    Genre: {name: "", description: ""},
 *    Director: {name: "", bio: "", birthDay: Date Object},
 *    imagePath: "",
 *    featured: Boolean
 *  }
 */
app.get(
  '/movies/:movieTitle',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ movieTitle: req.params.movieTitle })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Get genre data by genre name
 * @name GET /movies/genres/:genreName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 *  {
 *    Genre: {name: "", description: ""},
 *  }
 */
app.get(
  '/movies/genres/:genreName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Genre.name': `${req.params.genreName}` })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Get director data by director name
 * @name GET /movies/directors/:directorName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 *  {
 *    Director: {name: "", bio: "", birthDay: Date Object},
 *  }
 */
app.get(
  '/movies/directors/:directorName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Movies.findOne({ 'Director.name': `${req.params.directorName}` })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Register new users
 * @name POST /users
 * @example
 * Request data format
 * {
 *  userName: "",
 *  password:"",
 *  userEmail: "",
 *  userBirthDate: Date Object
 * }
 * @example
 * Response data format
 * {
 *    favoriteMovies: Empty Array,
 *    userName: "",
 *    userEmail: "",
 *    userBirthDate: Date Object,
 *    password: "",
 *   }
 */
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
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.password);

    Users.findOne({ userName: req.body.userName })
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.userName + ' already exists');
        } else {
          Users.create({
            userName: req.body.userName,
            password: hashedPassword,
            userEmail: req.body.userEmail,
            userBirthDate: req.body.userBirthDate,
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

/**
 * @description Update user info
 * @name PUT /users/:userName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *  userName: "",
 *  password:"",
 *  userEmail: "",
 *  userBirthDate: Date Object
 * }
 * @example
 * Response data format
 * {
 *    userName: "",
 *    password: "",
 *    userEmail: "",
 *    userBirthDate: Date Object,
 *   }
 */
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
    check('BirthDate').isLength({ min: 10 }),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // prevent logged-in users from modifying other user data
    // if (req.user.userName !== req.params.userName) {
    //   return res.status(400).send('Permission denied');
    // }

    let hashedPassword = Users.hashPassword(req.body.password);

    Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $set: {
          userName: req.body.userName,
          password: hashedPassword,
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

/**
 * @description Add movie to favorite list
 * @name POST /users/:userName/movies/:movieId
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *  userName: "",
 *  password:"",
 *  userEmail: "",
 *  userBirthDate: Date Object,
 *  favoriteMovies: [Object ID, ...]
 * }
 * @example
 * Response data format
 * {
 *    userName: "",
 *    password: "",
 *    userEmail: "",
 *    userBirthDate: Date Object,
 *    favoriteMovies: [Object ID, ...]
 *   }
 */

app.post(
  '/users/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  [check('movieId', 'movieId is required').not().isEmpty()],
  (req, res) => {
    Users.findOneAndUpdate(
      { userName: req.params.userName },
      {
        $push: { favoriteMovies: req.params.movieId },
      },
      { new: true }
    ) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        let uniqueMovies = [];
        updatedUser.favoriteMovies.forEach((m) => {
          if (!uniqueMovies.includes(m)) {
            uniqueMovies.push(m);
          }
        });
        updatedUser.favoriteMovies = uniqueMovies;
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
  }
);

/**
 * @description Remove movie to favorite list
 * @name DELETE /users/:userName/movies/:movieId
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * {
 *  userName: "",
 *  password:"",
 *  userEmail: "",
 *  userBirthDate: Date Object,
 *  favoriteMovies: [Object ID, ...]
 * }
 * @example
 * Response data format
 * {
 *    userName: "",
 *    password: "",
 *    userEmail: "",
 *    userBirthDate: Date Object,
 *    favoriteMovies: [Object ID, ...]
 *   }
 */
app.delete(
  '/users/:userName/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  [check('movieId', 'movieId is required').not().isEmpty()],
  (req, res) => {
    Users.findOneAndUpdate(
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

/**
 * @description Remove user account
 * @name DELETE /users/:userName
 * @example
 * Authentication: Bearer token (JWT)
 * Request data format
 * none
 * @example
 * Response data format
 * none
 */
app.delete(
  '/users/:userName',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Users.findOneAndDelete({
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

// Start - Code from 2.4
// list all objects
app.get('/images', (req, res) => {
  listObjectsParams = {
    Bucket: 'images-2.4',
  };
  s3Client
    .send(new ListObjectsV2Command(listObjectsParams))
    .then((listObjectsResponse) => {
      console.log(listObjectsResponse);
      res.send(listObjectsResponse);
    });
});

// upload file
app.post('/images/:imageName', (req, res) => {
  const input = {
    Bucket: 'images-2.4',
    Key: req.params.imageName,
    Body: JSON.stringify(req.body),
  };
  const command = new PutObjectCommand(input);
  s3Client
    .send(command)
    .then((uploadedFile) => {
      res
        .status(200)
        .send(req.params.imageName + 'was uploaded' + uploadedFile);
    })
    .catch((err) => {
      console.error(err);
      res.status(502).send(`error for upload` + err);
    });
});

// list a specific objects
app.get('/images/:imageName', (req, res) => {
  // listObjectsParams = {
  //   Bucket: 'images-2.4',
  //   Key: req.params.imageName,
  // };

  const input = {
    Bucket: 'images-2.4',
    Key: req.params.imageName,
  };
  const command = new GetObjectCommand(input);
  s3Client
    .send(command)
    .then((listObjectResponse) => {
      res
        .status(200)
        .send(
          `${req.params.imageName} was successfully found. The resource file type is: ` +
            listObjectResponse.ContentType
        );
    })
    .catch((err) => {
      console.error(err);
      res
        .status(404)
        .send(`Could not find the file: ${req.params.imageName}: ` + err);
    });
});
// End - Code from 2.4

app.get('/', (req, res) => {
  res.send('Welcome to myFlix Movie App!');
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
