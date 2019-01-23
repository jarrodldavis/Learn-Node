const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed login',
  successRedirect: '/',
  successFlash: 'Successfully logged in'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('error', 'You must be logged in');
    res.redirect('/login');
  }
}

exports.forgot = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash('error', 'No account with that email exists.');
    return res.redirect('/login');
  }

  user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

  await user.save();

  const resetURL = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  req.flash('success', `You have been emailed a password reset link. ${resetURL}`); // TODO: email

  res.redirect('/login');
};

exports.findResetUser = async (req, res, next) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash('error', 'Password reset is invalid or has expired');
    res.redirect('/login');
  } else {
    req.resetUser = user;
    next();
  }
}

exports.reset = async (req, res) => {
  res.render('reset', { title: 'Reset Password' })
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body['password-confirm']) {
    return next();
  }

  req.flash('error', 'Passwords do not match');
  res.redirect('back');
}

exports.update = async (req, res) => {
  const user = req.resetUser;
  await user.setPassword(req.body.password);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash('success', 'Password has been reset. You are now logged in');
  res.redirect('/');
}
