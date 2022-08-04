const express = require("express");
const authRoutes = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const router = express.Router();
const saltRounds = 10;
const { isAuthenticated } = require("../middleware/jwt.middleware");

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
	const { profileName, email, pwd } = req.body;
	console.log(pwd);

	if (screenName === "" || email === "" || pwd === "") {
		res.status(400).json({ message: "Provide email and password" });
		return;
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (!emailRegex.test(email)) {
		res.status(400).json({ message: "Provide a valid email address." });
		return;
	}

	if (profileName.length < 5) {
		res
			.status(400)
			.json({ message: "Profile name must be longer than 5 characters" });
	}

	if (pwd.length < 7) {
		res
			.status(400)
			.json({ message: "Passowrd must be longer than 7 characters" });
	}

	User.findOne({ profileName, email })
		.then((foundUser) => {
			if (foundUser) {
				res.status(400).json({ message: "User already exists." });
				return;
			}

			const salt = bcrypt.genSaltSync(saltRounds);
			const hashedPassword = bcrypt.hashSync(pwd, salt);

			return User.create({ profileName, email, pwd: hashedPassword });
		})
		.then((createdUser) => {
			const { profileName, email, _id } = createdUser;
			const user = { profileName, email, _id };
			res.status(201).json({ user: user });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json({ message: "Internal Server Error" });
		});
});

// POST  /auth/login
// ...
router.post("/login", (req, res, next) => {
	const { email, pwd } = req.body;

	if (email === "" || pwd === "") {
		res.status(400).json({ message: "Provide email and password." });
		return;
	}

	User.findOne({ email })
		.then((foundUser) => {
			console.log(foundUser);
			if (!foundUser) {
				res.status(401).json({ message: "User not found." });
				return;
			}

			const passwordCorrect = bcrypt.compareSync(pwd, foundUser.pwd);

			if (passwordCorrect) {
				const { _id, email } = foundUser;
				const payload = { _id, email };

				const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
					algorithm: "HS256",
					expiresIn: "6h",
				});

				res.status(200).json({ authToken: authToken });
			} else {
				res.status(401).json({ message: "Unable to authenticate the user" });
			}
		})
		.catch((err) => res.status(500).json({ message: "Internal Server Error" }));
});

// GET  /auth/verify
// ...
router.get("/verify", isAuthenticated, (req, res, next) => {
	console.log(`req.payload`, req.payload);

	res.status(200).json(req.payload);
});

module.exports = router;
