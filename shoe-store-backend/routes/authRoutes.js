const express = require("express");
const { login, register, getAllUsers, changePassword, deleteUser, createUserByAdmin, updateProfile, updateUserByAdmin } = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");
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
router.put("/change-password", protect, changePassword);
router.put("/update-profile", protect, updateProfile);
router.get("/users", getAllUsers);
router.post("/users", protect, createUserByAdmin);
router.put("/users/:id", protect, admin, updateUserByAdmin);
router.delete("/users/:id", protect, deleteUser);

module.exports = router;
