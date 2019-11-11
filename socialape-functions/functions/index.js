const functions = require("firebase-functions");




const express = require("express");
const app = express();
const FBAuth = require('./util/FBAuth');
const { getAllScreams, postOneScream, getScream, commentOnScream } = require('./handlers/screams');
const { signUp, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');

const dotenv = require("dotenv");
dotenv.config();





// SCREAM ROUTES
// get screams
app.get("/screams", getAllScreams);
// post a scream
app.post("/scream", FBAuth, postOneScream);
// get 
app.get('/scream/:screamId', getScream);
// TODO: delete scream
// TODO: like a scream
// TODO unlike a scream
// TODO comment on scream
app.post('/scream/:screamId/comment', FBAuth, commentOnScream)

// USER ROUTES
// signup route
app.post("/signup", signUp);
// login route
app.post("/login", login);
// image route
app.post('/user/image', FBAuth, uploadImage);
// route to add user details
app.post('/user', FBAuth, addUserDetails);
// get credentials route
app.get('/user', FBAuth, getAuthenticatedUser)




exports.api = functions.https.onRequest(app);
