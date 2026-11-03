require('dotenv').config();
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://JohannPurp:Purp123@cluster0.opr5ivt.mongodb.net/Johann876';
const Johann876 = process.env.MONGODB_DATABASE || 'lesson_store';

async function connectToDatabase() {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set. Add it to your .env file.');
    }
    const client = new MongoClient(mongoUri);
    await client.connect();
    return client.db(databaseName);
}

module.exports = { connectToDatabase };
