const express = require('express');
const morgan = require('morgan');
const app = express();

const movies = [
  {
    title: 'The Butterfly Effect',
    director: 'Eric Bress and J. Mackye Gruber',
    dateReleased: 2004,
  },
  {
    title: 'The Dark Knight',
    director: 'Christopher Nolan',
    dateReleased: 2008,
  },
  {
    title: 'Anaconda',
    director: 'Luis Llosa',
    dateReleased: 1997,
  },
  {
    title: 'Wrong Turn',
    director: 'Rob Schmidt',
    dateReleased: 2003,
  },
  {
    title: 'The Conjuring',
    director: 'James Wan',
    dateReleased: 2013,
  },
  {
    title: 'Paranormal Activity',
    director: 'Oren Peli',
    dateReleased: 2007,
  },
  {
    title: 'Home Alone',
    director: 'Chris Columbus',
    dateReleased: 1990,
  },
  {
    title: 'The Terminator',
    director: 'James Cameron',
    dateReleased: 1984,
  },
  {
    title: 'Before Sunrise',
    director: 'Richard Linklater',
    dateReleased: 1995,
  },
  {
    title: 'Scarface',
    director: 'Brian De Palma',
    dateReleased: 1983,
  },
];

app.use(morgan('common'));

// Get a list of all movies
app.get('/movies', (req, res) => {
  res.json(movies);
  res.send('Succesful GET request. Display a list of all movies');
});

// Return data about a single movie by title
app.get('/movies/:movie-title/', (req, res) => {
  res.send('Succesful GET request. Display data about a single movie');
});

// Return data about a genre by movie title
app.get('/movies/:movie-title/genre', (req, res) => {
  res.send('Succesful GET request. Display data about a genre by movie title');
});

// Return data about a director by name
app.get('/movies/:director', (req, res) => {
  res.send('Succesful GET request. Display data about director');
});

// Allow new users to register
app.post('/users', (req, res) => {
  res.send('Succesful POST request. New user registered');
});

// Allow  users to update their user info
app.put('/users/:id', (req, res) => {
  res.send('Succesful PUT request. User info updated');
});

// Allow  users to add a movie to their list of favorites
app.post('/users/:id/favorite-movies', (req, res) => {
  res.send('Succesful POST request. Movie added to list of favorites');
});

// Allow  users to remove a movie from their list of favorites
app.delete('/users/:id/favorite-movies', (req, res) => {
  res.send('Succesful DELETE request. Movie deleted from favorites');
});

// Allow  users to deregister
app.delete('/users/:id', (req, res) => {
  res.send('Succesful DELETE request. User was deleted');
});

///////////

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

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
