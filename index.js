const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bmgmcoi.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("brandShopDB");
    const productCollection = database.collection("products");

    //API to get multiple products based on brand Name
    app.get("/products/brands/:brandName", async (req, res) => {
      console.log('Inside: /products/brands/:brandName"');
      const brandName = req.params.brandName;
      const query = { brandName: brandName };
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //API to get a single products based on product ID
    app.get("/products/:id", async (req, res) => {
      console.log('Inside: /products/:id"');
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });


    //API to add product
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log('New Product -> ', newProduct);
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Brand-Shop server is running");
})

app.listen(port, () => {
  console.log(`Brand-Shop Server running on port ${port}`);
})