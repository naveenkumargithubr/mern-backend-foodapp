const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 6001;

//dotenv config for secure connections
require("dotenv").config();
console.log(process.env.DB_USER);

//middleware
app.use(cors()); // for cross origin requests
app.use(express.json()); // for send the data

//mongodb database connection
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@mern-foodie-client-serv.1tzuoqx.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    //connect to atlas database & collections
    const menuCollections = client.db("foodie-client-db").collection("menus");
    const cartCollections = client
      .db("foodie-client-db")
      .collection("cartItems");
    const userCollections = client.db("foodie-client-db").collection("users");

    //all menu items operations http requests
    //get all the menu items
    app.get("/menu", async (req, res) => {
      const result = await menuCollections.find().toArray();
      res.send(result);
    });

    //all cart operations
    //post add to card data to database
    app.post("/carts", async (req, res) => {
      const cartItems = req.body;
      const result = await cartCollections.insertOne(cartItems);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await userCollections.insertOne(users);
    });

    //get carts using email
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      const filter = { email: email };
      const result = await cartCollections.find(filter).toArray();
      res.send(result);
    });

    //get a specific carts
    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cartCollections.findOne(filter);
      res.send(result);
    });

    //delete items from cart
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await cartCollections.deleteOne(filter);
      res.send(result);
    });

    //update carts item quantity
    app.put("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const { quantity } = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: { quantity: parseInt(quantity, 10) },
      };

      const result = await cartCollections.updateOne(
        filter,
        updateDoc,
        options
      );
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`app is listening on port ${port}`);
});
