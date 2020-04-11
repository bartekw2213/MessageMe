const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    selectedRoom: String
});

const ChatUser = mongoose.model('ChatUser', userSchema);

module.exports = ChatUser;