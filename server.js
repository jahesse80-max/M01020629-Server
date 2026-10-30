const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const databaseName = process.env.MONGODB_DATABASE || 'lesson_store';
const imagesDirectory = path.join(__dirname, 'public', 'images');

const seedLessons = [
    { topic: 'Math', location: 'Hendon', price: 100, space: 5, image: 'math.jpg' },
    { topic: 'English', location: 'Colindale', price: 80, space: 5, image: 'english.jpg' },
    { topic: 'Science', location: 'Brent Cross', price: 90, space: 5, image: 'science.jpg' },
    { topic: 'History', location: 'Golders Green', price: 95, space: 5, image: 'history.jpg' },
    { topic: 'Art', location: 'Hampstead', price: 75, space: 5, image: 'art.jpg' },
    { topic: 'Music', location: 'Finchley', price: 110, space: 5, image: 'music.jpg' },
    { topic: 'Computing', location: 'Mill Hill', price: 120, space: 5, image: 'computing.jpg' },
    { topic: 'French', location: 'Edgware', price: 85, space: 5, image: 'french.jpg' },
    { topic: 'Geography', location: 'Wembley', price: 90, space: 5, image: 'geography.jpg' },
    { topic: 'Drama', location: 'Kentish Town', price: 70, space: 5, image: 'drama.jpg' }
];

let database;

// Logs every request so the request method, URL, and response time can be inspected.
app.use((request, response, next) => {
    const startedAt = Date.now();
    response.on('finish', () => {
        console.log(`${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - startedAt}ms`);
    });
    next();
});

app.use(cors());
app.use(express.json());
app.use('/images', express.static(imagesDirectory));
app.use('/images', (request, response) => {
    response.status(404).json({ error: 'Image file not found' });
});

function getDatabase() {
    if (!database) {
        throw new Error('Database is not connected');
    }
    return database;
}

function parseLessonId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

app.get('/lessons', async (request, response, next) => {
    try {
        const lessons = await getDatabase().collection('lessons').find().toArray();
        response.json(lessons);
    } catch (error) {
        next(error);
    }
});

app.post('/orders', async (request, response, next) => {
    try {
        const { name, phone, lessonIDs, space } = request.body;
        if (!/^[A-Za-z ]+$/.test(name || '') || !(name || '').trim() ||
            !/^[0-9]+$/.test(String(phone || '')) ||
            !Array.isArray(lessonIDs) || lessonIDs.length === 0 ||
            !Number.isInteger(space) || space < 1) {
            return response.status(400).json({
                error: 'name, numeric phone, lessonIDs, and a positive space value are required'
            });
        }

        const order = {
            name: name.trim(),
            phone: String(phone),
            lessonIDs,
            space,
            createdAt: new Date()
        };
        const result = await getDatabase().collection('orders').insertOne(order);
        response.status(201).json({ ...order, _id: result.insertedId });
    } catch (error) {
        next(error);
    }
});

app.put('/lessons/:id', async (request, response, next) => {
    try {
        const lessonId = parseLessonId(request.params.id);
        if (!lessonId) {
            return response.status(400).json({ error: 'Invalid lesson ID' });
        }

        const updates = {};
        const allowedAttributes = ['topic', 'location', 'price', 'space', 'image'];
        for (const attribute of allowedAttributes) {
            if (request.body[attribute] !== undefined) {
                updates[attribute] = request.body[attribute];
            }
        }
        if (Object.keys(updates).length === 0) {
            return response.status(400).json({ error: 'At least one lesson attribute is required' });
        }
        if (updates.space !== undefined && (!Number.isInteger(updates.space) || updates.space < 0)) {
            return response.status(400).json({ error: 'space must be a non-negative integer' });
        }
        if (updates.price !== undefined && (typeof updates.price !== 'number' || updates.price < 0)) {
            return response.status(400).json({ error: 'price must be a non-negative number' });
        }

        const result = await getDatabase().collection('lessons').findOneAndUpdate(
            { _id: lessonId },
            { $set: updates },
            { returnDocument: 'after' }
        );
        if (!result) {
            return response.status(404).json({ error: 'Lesson not found' });
        }
        response.json(result);
    } catch (error) {
        next(error);
    }
});

app.use((error, request, response, next) => {
    console.error(error);
    response.status(500).json({ error: 'Internal server error' });
});

async function startServer() {
    const client = new MongoClient(mongoUri);
    await client.connect();
    database = client.db(databaseName);

    const lessons = database.collection('lessons');
    if (await lessons.countDocuments() === 0) {
        await lessons.insertMany(seedLessons);
        console.log(`Seeded ${seedLessons.length} lessons`);
    }

    app.listen(port, () => {
        console.log(`App started on port ${port}`);
    });
}

if (require.main === module) {
    startServer().catch((error) => {
        console.error('Unable to start server:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, startServer };