const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

const app = express();
const port = process.env.PORT || 5000;

// ✅ IMPORTANT MIDDLEWARES
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const db = client.db("doctor");
    const doctorsCollection = db.collection("doctor");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    // all doctors
    app.get('/doctors', async (req, res) => {
      const result = await doctorsCollection.find().toArray();
      res.send(result);
    });

    // single doctor
    app.get('/doctors/:id', async (req, res) => {
      const { id } = req.params;
      const result = await doctorsCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    app.get("/booking/:userEmail", async (req, res) => {
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

    app.delete('/booking/:bookingId', async (req, res) => {
      const { bookingId } = req.params;
      const result = await bookingsCollection.deleteOne({ _id: new ObjectId(bookingId) });
      res.send(result);
    }); 


    



    await client.db("admin").command({ ping: 1 });
    console.log("MongoDB connected!");
  } finally {
    // keep alive
  }
}

run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});