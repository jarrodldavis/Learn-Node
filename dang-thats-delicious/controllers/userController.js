const mongoose = require('mongoose');
const User = mongoose.model('User');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
};

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody('name');
  req.checkBody('name', 'You must provide a name!').notEmpty();

  req.checkBody('email', 'That email is invalid').isEmail();
  req.sanitizeBody('email').normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });

  req.checkBody('password', 'Password cannot be empty').notEmpty();
  req.checkBody('password-confirm', 'Password confirmation cannot be empty').notEmpty();
  req.checkBody('password-confirm', 'Password confirmation does not match password').equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash('error', errors.map(error => error.msg));
    res.render('register', { title: 'Register', body: req.body, flashes: req.flash() });
  } else {
    next();
  }
};

exports.register = async (req, res, next) => {
  const user = new User({ email: req.body.email, name: req.body.name });
  await User.register(user, req.body.password);
  next();
}
