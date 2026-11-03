require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DATABASE || 'Johann876';

async function connectToDatabase() {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set. Add it to your .env file.');
    }
    const client = new MongoClient(mongoUri);
    await client.connect();
    return client.db(databaseName);
}

module.exports = { connectToDatabase };
