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

// Display 'movies' JSON object
app.get('/movies', (req, res) => {
  res.json(movies);
});

app.get('/', (req, res) => {
  res.send("It's hot today, eat some icecream");
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
