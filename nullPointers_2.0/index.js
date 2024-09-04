const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { logReqRes } = require('./middlewares/log');
const routes = require('./routes');

const app = express();
const PORT = 7000;

// MongoDB Connection
const uri = "mongodb+srv://Suhas:XK5z55hBUJqahszP@null-pointers.vdsmm.mongodb.net/?retryWrites=true&w=majority";

async function run() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Mongoose connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
  }
}

run();

app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));
app.use(express.static('./assets'));
app.use(express.static('./scripts'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logReqRes("log.txt"));

app.use('/', routes);

app.listen(PORT, (error) => {
  if (error) {
    console.log("Error connecting with server", error);
  } else {
    console.log(`Server is listening on port -> ${PORT}`);
    console.log(`http://localhost:${PORT}`);
  }
});