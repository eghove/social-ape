const functions = require("firebase-functions");




const express = require("express");
const app = express();
const FBAuth = require('./util/FBAuth');
const { getAllScreams, postOneScream } = require('./handlers/screams');
const { signUp, login } = require('./handlers/users');

const dotenv = require("dotenv");
dotenv.config();





// SCREAM ROUTES
// get screams
app.get("/screams", getAllScreams);
// post a scream
app.post("/scream", FBAuth, postOneScream);

// USER ROUTES
// signup route
app.post("/signup", signUp);
// login route
app.post("/login", login);





exports.api = functions.https.onRequest(app);
