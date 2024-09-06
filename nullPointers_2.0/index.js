const express = require('express');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');

const { logReqRes } = require('./middlewares/log');

const staticRouter = require('./routes/index');
const userRouter = require('./routes/users')
const { passport } = require('./scripts/Oauth'); // Import passport strategies from oauth.js
const session = require('express-session');

const app = express();
const PORT = 7000;

// MongoDB Connection
const uri = "mongodb+srv://saksham:qgNJBitFGTK7JLrb@null-pointers.jj4nx.mongodb.net/?retryWrites=true&w=majority&appName=Null-Pointers";

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

// Setting paths and view engine
app.set("view engine", "ejs");
app.set("views", path.resolve('./views'));
app.use(express.static('./assets'));
app.use(express.static('./scripts'));
app.use(express.static('./apps'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logReqRes("log.txt"));

app.use(session({
  secret: 'e33b92145a61635ff2992e8a4fc6a33711d4365bd7f6000276855498196aed93',  // Replace with a secure key
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/', staticRouter);
app.use('/user', userRouter);

// Running server
app.listen(PORT, (error) => {
  if (error) {
    console.log("Error connecting with server", error);
  } else {
    console.log(`Server is listening on port -> ${PORT}`);
    console.log(`\n\nhttp://localhost:${PORT}\n\n`);
  }
});