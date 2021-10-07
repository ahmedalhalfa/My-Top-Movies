const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const { body } = require("express-validator");
const User = require("../models/user");

// /POST /signup
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        try {
          const userDoc = await User.findOne({ email: req.body.email });
          if (userDoc) return Promise.reject("E-mail address already exists");
        } catch (err) {
          return Promise.reject("system failure");
        }
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 6 })
      .withMessage("password is too short"),
    body("name").trim().not().isEmpty(),
  ],
  authControllers.postSignup
);

// /POST /login
router.post("/login", authControllers.postLogin);

// /PATCH /edit --> for editing user info

module.exports = router;
