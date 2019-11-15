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
  getAuthenticatedUser,
  getUserDetails,
  markNotificationsRead
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
// other user details
app.get("/user/:handle", getUserDetails);
// route to update notifications
app.post("/notifications", FBAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

// like notification trigger
exports.createNotificationOnLike = functions.firestore
  .document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch(err => {
        console.error(err);
      });
  });

// deleting the notification upon unlike
exports.deleteNotificationOnUnlike = functions.firestore
  .document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

// comment notification trigger
exports.createNotificationOnComment = functions.firestore
  .document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
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
      .catch(err => {
        console.error(err);
        return;
      });
  });

// trigger to change all image change
exports.onUserImageChange = functions.firestore
  .document("/users/{userId}")
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());

    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      const batch = db.batch();
      return db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    } else return true;
  });

// make sure all ancillary scream data is deleted along with the scream dd
exports.deleteNotificationOnUnlike = functions.firestore
  .document("/screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db.collection("likes").where("screamId", "==", screamId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db.collection("notifications").where("screamId", "==", screamId).get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch( err=> console.error(err));
  });
