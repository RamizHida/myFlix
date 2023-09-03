const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  // movieId: { type: Number, required: true },
  movieTitle: { type: String, required: true },
  description: { type: String, required: true },
  Genre: {
    name: String,
    description: String,
  },
  Director: {
    name: String,
    bio: String,
    birthday: Date,
    deathyear: String || Date,
  },
  imagePath: String,
  featured: Boolean,
});

let Movie = mongoose.model('Movie', movieSchema);

let userSchema = mongoose.Schema({
  // userId: { type: String, required: true },
  userName: { type: String, required: true },
  password: { type: String, required: true },
  userEmail: { type: String, required: true },
  userBirthDate: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
};

let User = mongoose.model('User', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
