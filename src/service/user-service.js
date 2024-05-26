const User = require('../models/user');

const getAllUsers = async () => {
    return await User.find({});
};

const getUserById = async (userId) => {
    return await User.findOne({ id: userId });
}

const createUserIfNotExist = async (userData) => {
    try {
        let user = await User.findOne({ id: userData.id });
        if (!user) {
            user = new User(userData);
            await user.save();
        }
        return user;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
};

const configUser = async (userId, userData) => {
    try {
        return await User.findOneAndUpdate({ id: userId }, { $set: userData }, { new: true });
    } catch (error) {
        throw new Error('Error configuring user: ' + error.message);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUserIfNotExist,
    configUser,
};

