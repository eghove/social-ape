const { admin } = require('./admin');

// for protecting the routes
module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    // .then(snapshot => {
    //   if (snapshot.empty) {
    //     console.log("No matching documents.");
    //     return next();
    //   } else {
    //     snapshot.forEach(doc => {
    //       let temp = doc.data().handle;
    //       req.user.handle = temp;
    //       return next();
    //     });
    //   }
    // })
    .then(data => {
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};