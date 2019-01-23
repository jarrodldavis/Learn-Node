const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const { promisify } = require('util');

const md5 = require('md5');
const validator = require('validator');
const errorHandler = require('mongoose-mongodb-errors');
const passport = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email address'],
    required: 'Please provide an email address'
  },
  name: {
    type: String,
    required: 'Please provide a name',
    trim: true
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.virtual('gravatar').get(function() {
  return `https://gravatar.com/avatar/${md5(this.email)}?s=200&d=retro`
})

userSchema.plugin(passport, { usernameField: 'email' });
userSchema.plugin(errorHandler);

userSchema.statics.register = promisify(userSchema.statics.register);
userSchema.methods.setPassword = promisify(userSchema.methods.setPassword);

module.exports = mongoose.model('User', userSchema);
