// load .env data into process.env
require('dotenv').config();

// Web server config
const PORT       = process.env.PORT || 8080;
const ENV        = process.env.ENV || "development";
const express    = require("express");
const bodyParser = require("body-parser");
const sass       = require("node-sass-middleware");
const app        = express();
const morgan     = require('morgan');
const cookieSession    = require('cookie-session');

// PG database client/connection setup
const { Pool } = require('pg');
const dbParams = require('./lib/db.js');
const db = new Pool(dbParams);
db.connect();

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/styles", sass({
  src: __dirname + "/styles",
  dest: __dirname + "/public/styles",
  debug: true,
  outputStyle: 'expanded'
}));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys:['key1','key2'],
  maxAge: 24 * 60 * 60 * 1000 //24 hours
  })
);

// Separated Routes for each Resource
// API routes
const usersApiRoutes = require("./routes/users-api");
const mapsApiRoutes = require("./routes/maps-api");
const locationsApiRoutes = require("./routes/locations-api");
// User routes
const mapsRoutes = require("./routes/maps");
const usersRoutes = require("./routes/users");
const locationsRoutes = require("./routes/locations");

// Mount all resource routes
app.use("/api/users", usersApiRoutes(db));
app.use("/api/maps", mapsApiRoutes(db));
app.use("/api/locations", locationsApiRoutes(db));
app.use("/maps", mapsRoutes(db));
app.use("/users", usersRoutes(db));
app.use("/locations", locationsRoutes(db));

// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.get("/", (req, res) => {
  res.redirect("/maps");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
