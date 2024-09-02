const express = require('express');
const path = require('path');
// const mongoose = require('mongoose');

const { logReqRes } = require('./middlewares/log');

const app = express();
const PORT = 7000;

// Connection
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://saksham:1AGrEtT2wLj272T5@null-ptrs.2idnn.mongodb.net/?retryWrites=true&w=majority&appName=null-ptrs";

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);


app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));
app.use(express.static('./assets'));
app.use(express.static('./assets'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(logReqRes("log.txt"));

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, (error) => {
    if(error){
        console.log("Error connecting with server", error);
    }
    else{
        console.log(`Server is listening on port -> ${PORT}`);
        console.log(`http://localhost:${PORT}`);
    }
})