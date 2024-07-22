const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new Schema({
  email: { type: String, required: true, maxLength: 100 },
  username: { type: String, required: true, minLength: 3, maxLength: 100 },
  password: { type: String },
  salt: { type: String },
  fullName: { type: String },
  bio: { type: String },
  image: { type: String },
})

// JWT을 생성하는 메서드
UserSchema.methods.generateJWT = function () {
  return jwt.sign({
    username: this.username
  }, process.env.SECRET)
}

// 비밀번호를 암호화하는 메서드
UserSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex');

  this.password = crypto
    .pbkdf2Sync(password, this.salt, 310000, 32, 'sha256')
    .toString('hex');
}

// 비밀번호를 확인하는 메서드
UserSchema.methods.checkPassword = function (password) {
  const hashedPassword = crypto
    .pbkdf2Sync(password, this.salt, 310000, 32, "sha256")
    .toString("hex")

  return this.password === hashedPassword;
}

module.exports = mongoose.model('User', UserSchema);

