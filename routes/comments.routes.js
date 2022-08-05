const express = require("express");
const router = express.Router();
const Comment = require("../models/Comments.model");
const { isAuthenticated } = require("../middleware/jwt.middleware");

// router.get("/:postId", async (req, res) => {
// 	const postId = req.params.postId;
// 	const comments = await Comments.findAll({ where: { PostId: postId } });
// 	res.json(comments);
// });

// router.post("/", async (req, res) => {
// 	const comment = req.body;
// 	await Comments.create(comment);
// 	res.json(comment);
// });

//make a comment on a game
router.post("/new-comment/:gameId", isAuthenticated, (req, res, next) => {
	const content = req.body.content;
	Comment.create({
		userId: req.payload._id,
		content,
		igdbId: req.params.gameId,
	})
		.then((newComment) => {
			console.log(newComment);
			res.status(200).json(newComment);
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

//get all comments for a game in order that they were posted
router.get("/game-comments/:gameId", (req, res, next) => {
	Comment.find({ igdbId: req.params.gameId })
		.populate("userId")
		.then((commentsArray) => {
			console.log(commentsArray);
			res.status(200).json({ commentsArray });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

//get all user comments in order that they were posted
router.get("/user-comments", isAuthenticated, (req, res, next) => {
	Comment.find({ userId: req.payload._id })
		.then((commentsArray) => {
			console.log(commentsArray);
			res.status(200).json({ commentsArray });
		})
		.catch((err) => {
			console.log(err);
			res.status(500).json(err);
		});
});

//edit a comment that we own
router.put("/edit-comment/:commentId", isAuthenticated, (req, res, next) => {
	const newContent = req.body.content;
	Comment.findById(req.params.commentId).then((foundComment) => {
		if (foundComment.userId.toString() === req.payload._id) {
			//allow edit
			foundComment.content = newContent;
			foundComment
				.save()
				.then((savedComment) => {
					console.log(savedComment);
					res.status(200).json(savedComment);
				})
				.catch((err) => {
					console.log(err);
					res.status(500).json(err);
				});
		} else {
			res
				.status(403)
				.json({ message: "You can't edit someone else's comment!" });
		}
	});
});

//delete a comment that we ow
router.delete(
	"/delete-comment/:commentId",
	isAuthenticated,
	(req, res, next) => {
		Comment.findById(req.params.commentId).then((foundComment) => {
			if (foundComment.userId.toString() === req.payload._id) {
				//allow edit
				Comment.findByIdAndDelete(req.params.commentId)
					.then(() => {
						console.log("deleted");
						res.status(200).json({ message: "Deleted comment" });
					})
					.catch((err) => {
						console.log(err);
						res.status(500).json(err);
					});
			} else {
				res
					.status(403)
					.json({ message: "You can't delete someone else's comment!" });
			}
		});
	}
);

module.exports = router;
