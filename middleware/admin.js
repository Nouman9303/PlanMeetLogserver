function admin(req, res, next) {
  //   const decoded = jwt.verify(token, config.get("jwtSecret"));
  //   req.user = decoded;
  //   next();
  // if (!req.user.isAdmin) return res.status(403).send("access denied");
  if (req.user.Role !== "Admin") return res.status(403).send("access denied");
  next();
}
//hello
module.exports = admin;
