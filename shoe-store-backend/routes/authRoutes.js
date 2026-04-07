const express = require("express");
const { login, register, getAllUsers } = require("../controllers/authController");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Auth API — use POST for login/register (browser address bar only sends GET)",
    endpoints: {
      login: {
        method: "POST",
        path: "/api/auth/login",
        body: { email: "string", password: "string" },
      },
      register: {
        method: "POST",
        path: "/api/auth/register",
        body: { name: "string", email: "string", password: "string" },
      },
    },
  });
});

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAllUsers);

module.exports = router;
