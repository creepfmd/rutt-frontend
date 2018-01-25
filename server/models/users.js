import mongoose, { Schema } from 'mongoose';

var users = new Schema({
  name: String,
  password: String,
});

export default mongoose.model('users', users);
