import User from '../models/users';

export const allUsers = (req, res, next) => {
  User.find().lean().exec((err, users) => res.json(
    { users: users.map(u => ({
      ...u,
    }))}
  ));
};

export const getUser = (req, res, next) => {
  User.findById(req.params.userId).lean().exec((err, user) => res.json(
    user
  ));
};

export const getUserAuth = (req, res, next) => {
  User.findOne({ name: req.params.username }).lean().exec((err, user) => res.json(
    user
  ));
};


export const addUser = (req, res, next) => {
  let user = new User(req.body);
  user.save((err, user) => res.json(
    user
  ));
};

export const updateUser = (req, res, next) => {
  User.where({ _id: req.params.userId })
    .update(req.body, (err, user) => res.json(
    user
  ));
};

export const deleteUser = (req, res, next) => {
  User.findByIdAndRemove(req.params.userId).exec((err, user) => res.json(
    user
  ));
};
