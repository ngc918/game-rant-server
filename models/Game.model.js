const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const gameSchema = new Schema({
	name: String,
	igdbId: {
		type: Number,
	},
	coverUrl: {
		type: String,
	},
	summary: {
		type: String,
	},
	genres: [String],
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
});

const Game = model("Game", gameSchema);

module.exports = Game;
