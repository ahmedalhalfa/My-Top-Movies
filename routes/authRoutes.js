const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

// /POST /signup
router.post("signup", authControllers.postSignup)


// /POST /login
router.post("login", authControllers.postLogin);
