const functions = require("firebase-functions");

const express = require("express");
const app = express();
const FBAuth = require("./util/FBAuth");
const { db } = require("./util/admin");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeScream,
  unlikeScream,
  deleteScream
} = require("./handlers/screams");
const {
  signUp,
  login,
  uploadImage,
  addUserDetails,
  getAuthenticatedUser
} = require("./handlers/users");

const dotenv = require("dotenv");
dotenv.config();

// SCREAM ROUTES
// get screams
app.get("/screams", getAllScreams);
// post a scream
app.post("/scream", FBAuth, postOneScream);
// get
app.get("/scream/:screamId", getScream);
// TODO: delete scream
app.delete("/scream/:screamId", FBAuth, deleteScream);
// like a scream
app.get("/scream/:screamId/like", FBAuth, likeScream);
// unlike a scream
app.get("/scream/:screamId/unlike", FBAuth, unlikeScream);
// comment on scream
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);

// USER ROUTES
// signup route
app.post("/signup", signUp);
// login route
app.post("/login", login);
// image route
app.post("/user/image", FBAuth, uploadImage);
// route to add user details
app.post("/user", FBAuth, addUserDetails);
// get credentials route
app.get("/user", FBAuth, getAuthenticatedUser);

exports.api = functions.https.onRequest(app);

// like notification trigger
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// deleting the notification upon unlike
exports.deleteNotificationOnUnlike = f = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// comment notification trigger
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
