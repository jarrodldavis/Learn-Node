exports.homePage = (req, res) => {
  console.log(req.name);
  throw Error('oops');
  res.render('index');
};

exports.myMiddleware = (req, res, next) => {
  req.name = 'Jarrod';
  res.cookie('name', 'Jarrod is cool', { maxAge: 80000 })
  next();
};
