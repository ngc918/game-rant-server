const express = require("express");
const authRoutes = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const bcrypt = require("bcryptjs");
const router = express.Router();
const saltRounds = 10;

// POST /auth/signup  - Creates a new user in the database
router.post("/signup", (req, res, next) => {
	const { email, password } = req.body;

	if (email === "" || password === "") {
		res.status(400).json({ message: "Provide email and password" });
		return;
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
	if (!emailRegex.test(email)) {
		res.status(400).json({ message: "Provide a valid email address." });
		return;
	}

	if (password.length < 7) {
		res
			.status(400)
			.json({ message: "Passowrd must be longer than 7 characters" });
	}

	User.findOne({ email })
		.then((foundUser) => {
			if (foundUser) {
				res.status(400).json({ message: "User already exists." });
				return;
			}

			const salt = bcrypt.genSaltSync(saltRounds);
			const hashedPassword = bcrypt.hashSync(password, salt);

			return User.create({ email, password: hashedPassword });
		})
		.then((createdUser) => {
			const { email, _id } = createdUser;
			const user = { email, _id };
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
	const { email, password } = req.body;

	if (email === "" || password === "") {
		res.status(400).json({ message: "Provide email and password." });
		return;
	}

	User.findOne({ email })
		.then((foundUser) => {
			if (!foundUser) {
				res.status(401).json({ message: "User not found." });
				return;
			}

			const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

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

router.get("logout", (req, res) => {
	res.send("logging out");
});
// GET  /auth/verify
// ...

module.exports = router;
