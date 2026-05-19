const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require('jose-cjs');

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const Jwks = createRemoteJWKSet(
  new URL(`${process.env.Client_URL}/api/auth/jwks`)
)
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  try {
    const { payload } = await jwtVerify(token, Jwks);
    next();

    // req.user = payload;
  } catch (error) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
}


async function run() {
  try {
    // await client.connect();

    const db = client.db("doctor");
    const doctorsCollection = db.collection("doctor");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");


    app.get("/feature", async (req, res) => {
      const result = await doctorsCollection
        .find()
        .sort({ rating: -1 })
        .limit(4)
        .toArray();

      res.send(result);
    });

    // all doctors
    app.get('/doctors', async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });

    // single doctor
    app.get('/doctors/:id', verifyToken, async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });


    app.get("/booking/:userEmail", verifyToken, async (req, res) => {
      const { userEmail } = req.params;
      const result = await bookingsCollection.find({ userEmail }).toArray();
      res.send(result);
    });

    // booking POST
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.delete('/booking/:bookingId', verifyToken, async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingsCollection.deleteOne({ _id: new ObjectId(bookingId) });
      res.send(result);
    });


    app.put("/booking/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await bookingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );

      res.send(result);
    });



    // await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected!");
  } finally {

  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});