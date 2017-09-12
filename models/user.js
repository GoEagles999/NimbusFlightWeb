var mongoose = require('mongoose')
var Schema = mongoose.Schema

var db = require('../config/db')

var UserSchema = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  company: String,
  industry: String,
  phone_number: String,
  password: String,
  source: String
})

var User = db.model('User', UserSchema)

module.exports = User
