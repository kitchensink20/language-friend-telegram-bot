const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        unique: true,
    },
    is_bot: {
        type: Boolean,
        required: true,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
    },
    language_code: {
        type: String,
    },
    studying_language: {
        type: String,
    },
    language_level: {
        type: String,
        enum: ['A1', 'A2', 'B1', 'B2', 'C1'], 
    }
})

const User = mongoose.model('users', UserSchema);

module.exports = User;

