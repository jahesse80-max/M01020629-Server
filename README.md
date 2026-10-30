# Lesson Store Backend

## Requirements

- Node.js 20.19 or newer
- MongoDB running locally, or a MongoDB connection string

## Run

```bash
npm install
npm start
```

The server connects to `mongodb://127.0.0.1:27017` and uses the `lesson_store`
database by default. Override these values with `MONGODB_URI`, `MONGODB_DATABASE`,
and `PORT`. On the first successful start, ten lessons are inserted into the
`lessons` collection, each with five available spaces. Orders are saved in the
`orders` collection.

## API

- `GET /lessons` returns all lessons.
- `POST /orders` saves `{ "name", "phone", "lessonIDs", "space" }`.
- `PUT /lessons/:id` updates any supported lesson attribute: `topic`, `location`,
  `price`, `space`, or `image`.
- `GET /images/<filename>` serves files from `public/images`; missing files
  return a JSON 404 error.

Every request is logged to the server console with its method, URL, status code,
and response time.