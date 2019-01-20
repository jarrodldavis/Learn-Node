const express = require('express');
const router = express.Router();

// Do work here
router.get('/', (req, res) => {
  const jarrod = { name: 'Jarrod', age: 24, cool: true };
  // res.send('Hey! It works!');
  // res.json(jarrod);
  // res.json(req.query);
  jarrod.dog = req.query.dog
  jarrod.title = 'I love food'
  res.render('hello', jarrod);
});

router.get('/reverse/:name', (req, res) => {
  const reverse = [...req.params.name].reverse().join('');
  res.send(reverse);
})

module.exports = router;
