const passUserId = (req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.userName = req.session.userName;
  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/");
  }
};

module.exports = {passUserId, isLoggedIn};