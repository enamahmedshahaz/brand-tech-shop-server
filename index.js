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
    const cart = database.collection("cart");


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

    //API to update a product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;

      const product = req.body;

      // Create a filter for product  with the id 
      const filter = { _id: new ObjectId(id) };

      /* Set the upsert option to insert a document 
      if no documents match the filter */

      /* if set to false : If no documents match the filter criteria,
       the method does not perform any update operation  */
      const options = { upsert: true };

      // Specify the updated values for the fields 
      const updateProduct = {
        $set: {
          name: product.name,
          brandName: product.brandName,
          type: product.type,
          price: product.price,
          image: product.image,
          rating: product.rating,
          description: product.description
        },
      };

      // Update the first document that matches the filter
      const result = await productCollection.updateOne(filter, updateProduct, options);
      res.send(result);

    });


    //API to add a product to cart
    app.post("/cart", async (req, res) => {
      const cartProduct = req.body;

      const id = cartProduct._id;
      const query = { _id: id };
      const findResult = await cart.findOne(query);
      console.log('findrest: ', findResult, query);


      if (findResult) {
        const newQty = findResult.qty + 1;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: false };
        const updateProduct = {
          $set: {
            qty: newQty,
          },
        };

        const result = await productCollection.updateOne(filter, updateProduct, options);
        res.send(result);

      } else {
        cartProduct.qty = 1;
        const result = await cart.insertOne(cartProduct);
        res.send(result);
      }

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