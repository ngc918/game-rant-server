const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema({
	screenName: { type: String, unique: true, required: true },
	email: { type: String, unique: true, required: true },
	pwd: { type: String, required: true },
});

const User = model("User", userSchema);

module.exports = User;
