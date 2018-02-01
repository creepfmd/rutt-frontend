import mongoose, { Schema } from 'mongoose';

var objects = new Schema({
  userId : String,
  objectId: String,
  objectName: String,
  preloadScript: String,
  preloadActions: [{
    actionId: String,
    actionParameters: Array
  }],
  destinations: [{
    systemId: String,
    systemName: String,
    split: String,
    preloadScript: String,
    afterloadScript: String,
    preloadActions: [{
      actionId: String,
      actionParameters: Array
    }],
  }],
});

export default mongoose.model('objects', objects);
