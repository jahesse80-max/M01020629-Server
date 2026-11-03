const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://JohannPurp:Purp123@cluster0.opr5ivt.mongodb.net/Johann876';
const Johann876 = process.env.MONGODB_DATABASE || 'lesson_store';

async function connectToDatabase() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    return client.db(Johann876);
}

module.exports = { connectToDatabase };
