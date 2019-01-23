const mongoose = require('mongoose');
const Store = mongoose.model('Store');

const multer = require('multer');
const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    if (file.mimetype.startsWith('image/')) {
      next(null, true);
    } else {
      next({ message: 'That filetype is not allowed' }, false);
    }
  }
}

const jimp = require('jimp');
const uuid = require('uuid');

exports.homePage = (req, res) => {
  res.render('index');
};

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add Store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  next();
}

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash('success', `Successfully created ${store.name}. Care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', { title: 'Stores', stores });
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne({ _id: req.params.id });
  if (!store.author.equals(req.user._id)) {
    req.flash('error', 'You must own this store in order to edit it')
    res.redirect(`/store/${store.slug}`)
  } else {
    res.render('editStore', { title: `Edit ${store.name}`, store });
  }
}

exports.updateStore = async (req, res) => {
  req.body.location.type = 'Point';
  const store = await Store
    .findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true, upsert: true })
    .exec();

   req.flash('success',
    `Successfully updated <strong>${store.name}</strong>
     <a href="/stores${store.slug}">View Store &rarr;</a>`);
    
    res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate('author');
  if (!store) {
    next();
  } else {
    res.render('store', { title: store.name, store });
  }
}

exports.getStoresByTag = async (req, res) => {
  const active = req.params.tag;
  const [tags, stores] = await Promise.all([
    Store.getTagsList(),
    Store.find({ tags: active || { $exists: true } })
  ]);
  res.render('tags', { title: 'Tags', tags, stores, active })
}

exports.searchStores = async (req, res) => {
  const stores = await Store
    .find(
      { $text: { $search: req.query.q } },
      { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(5);

  res.json(stores);
}
