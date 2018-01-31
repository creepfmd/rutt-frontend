import express, { Router } from 'express';
import { allUsers, getUser, addUser, updateUser, deleteUser } from './controllers/users';
import { allObjects, getObject, addObject, updateObject, deleteObject } from './controllers/objects';
import { allSystems, getSystem, addSystem, updateSystem, deleteSystem } from './controllers/systems';

const router = Router();

router.route('/users').get(allUsers);

router.route('/user/:userId').
  get(getUser).
  post(addUser).
  put(updateUser).
  delete(deleteUser);

router.route('/objects/:userId').get(allObjects);

router.route('/object/:objectId').
  get(getObject).
  post(addObject).
  put(updateObject).
  delete(deleteObject);

router.route('/systems/:userId').get(allSystems);

router.route('/system/:systemId').
  get(getSystem).
  post(addSystem).
  put(updateSystem).
  delete(deleteSystem);

export default router;
