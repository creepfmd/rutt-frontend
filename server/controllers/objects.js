import Obj from '../models/objects';

export const allObjects = (req, res, next) => {
  Obj.find().lean().exec((err, objects) => res.json(
    { objects: objects.map(o => ({
      ...o,
    }))}
  ));
};

export const getObject = (req, res, next) => {
  Obj.findById(req.params.objectId).lean().exec((err, obj) => res.json(
    obj
  ));
};


export const addObject = (req, res, next) => {
  let obj = new Obj(req.body);
  obj.save((err, obj) => res.json(
    obj
  ));
};

export const updateObject = (req, res, next) => {
  Obj.where({ _id: req.params.objectId })
    .update(req.body, (err, obj) => res.json(
    obj
  ));
};

export const deleteObject = (req, res, next) => {
  Obj.findByIdAndRemove(req.params.objectId).exec((err, obj) => res.json(
    obj
  ));
};
