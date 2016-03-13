'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var JobSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean,
  jobTitle: String

});

export default mongoose.model('Job', JobSchema);
