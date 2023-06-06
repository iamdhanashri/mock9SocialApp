
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).send("Unauthorized");
  }

  jwt.verify(token, 'masai', (error, decodedToken) => {
    if (error) {
     res.status(401).json("Unauthorized");
    }
    req.user = decodedToken;
    next();
  });
};

module.exports = {authMiddleware};
