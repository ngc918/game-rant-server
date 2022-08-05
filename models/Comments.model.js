const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const commentSchema = new Schema(
	{
		userId: { type: Schema.Types.ObjectId, ref: "User" },
		igdbId: {
			type: Number,
		},
		content: String,
	},
	{ timestamps: true }
);

const Comment = model("Comment", commentSchema);

module.exports = Comment;
