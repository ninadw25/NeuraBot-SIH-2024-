const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const { logReqRes } = require('./middlewares/log');
const { authMiddleware } = require('./middlewares/authentication');
const { passport } = require('./scripts/Oauth.js');
const staticRouter = require('./routes/index');
const userRouter = require('./routes/users');
const adminRouter = require('./routes/admin.js')
const summarizerRoutes = require('./routes/summarizer.js')
const app = express();
const PORT = 7002;


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

app.use(session({
  secret: 'e33b92145a61635ff2992e8a4fc6a33711d4365bd7f6000276855498196aed93',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

// Middlewares
app.use(authMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logReqRes("log.txt"));

// Routes
app.use('/', staticRouter);
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/summarize', summarizerRoutes);

// Running server
app.listen(PORT, (error) => {
  if (error) {
    console.log("Error connecting with server", error);
  } else {
    console.log(`Server is listening on port -> ${PORT}`);
    console.log(`\n\nhttp://localhost:${PORT}\n\n`);
  }
});