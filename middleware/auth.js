const jwt = require("jsonwebtoken");
const config = require("config");
function auth(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).send("access denied you are not authorized");

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).send("token is not valid");
  }
}
module.exports = auth;
