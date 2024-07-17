const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    //added exp and level for level bar 20th June
    exp: {
        type: Number,
        default: 0
    },
    totalExp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    }
 });

 userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 10);
    }
    next();
 });
 const User = mongoose.model('User', userSchema);
 module.exports = User;