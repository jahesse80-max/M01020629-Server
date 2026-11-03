const { MongoClient } = require('mongodb');


const Johann876 = process.env.MONGODB_DATABASE || 'lesson_store';

async function connectToDatabase() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    return client.db(Johann876);
}

module.exports = { connectToDatabase };
