import Systems from '../models/systems';

export const allSystems = (req, res, next) => {
  Systems.find().where('userId').equals(req.params.userId).lean().exec((err, systems) => res.json(
    { systems: systems.map(s => ({
      ...s,
    }))}
  ));
};

export const getSystem = (req, res, next) => {
  Systems.findById(req.params.systemId).lean().exec((err, system) => res.json(
    system
  ));
};


export const addSystem = (req, res, next) => {
  let system = new Systems(req.body);
  system.save((err, system) => res.json(
    system
  ));
};

export const updateSystem = (req, res, next) => {
  Systems.where({ _id: req.params.systemId })
    .update(req.body, (err, system) => res.json(
      system
  ));
};

export const deleteSystem = (req, res, next) => {
  Systems.findByIdAndRemove(req.params.systemId).exec((err, system) => res.json(
    system
  ));
};
