const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const CONNECTION_LINK = process.env.MONGODB_CONNECTION_LINK;

function connectDB() {
    try {
        mongoose.connect(CONNECTION_LINK, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }

    const dbConnection = mongoose.connection;
    dbConnection.once('open', (_) => {
        console.log(`Connect to the database.`);
    });
 
    dbConnection.on('error', (err) => {
        console.error(`Connection error: ${err}`);
    });
    return;
}

module.exports = {
    connectDB,
}