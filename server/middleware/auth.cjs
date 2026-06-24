const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "questboard-dev-secret";

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Kein gültiger Authorization-Header." });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Token ist ungültig oder abgelaufen." });
  }
}

module.exports = {
  requireAuth,
  JWT_SECRET,
};