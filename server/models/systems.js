import mongoose, { Schema } from 'mongoose';
import hash from 'mongoose-hash';
import uniqueValidator  from 'mongoose-unique-validator';

let systems = new Schema({
  userId : String,
  systemId : { type: String, unique: true },
  publishToken : { type: String, unique: true },
  systemName : String,
  systemDescription : String,
  systemType : String,
  scriptLanguage : String,
  objectTypes : []
});

systems.plugin(uniqueValidator);

systems.plugin(hash, {
  field: 'systemId',
  size: 16
});

systems.plugin(hash, {
  field: 'publishToken',
  size: 16
});

export default mongoose.model('systems', systems);
