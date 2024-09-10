const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    prompt: {
        type: String
    }
});

const chats = mongoose.model("chats", chatSchema);

module.exports = chats;