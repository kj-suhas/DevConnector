const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route POST api/post
// @desc create a post
// @access Private

router.post('/', [ auth, [ check('text', 'Text is required').not().isEmpty() ] ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
	}

	try {
		const user = await User.findById(req.user.id).select('-password');
		const newPost = new Post({
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		});

		const post = await newPost.save();

		res.json(post);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route GET api/post
// @desc Get all posts
// @access Private

router.get('/', auth, async (req, res) => {
	try {
		const post = await Post.find().sort({ date: -1 });
		res.json(post);
	} catch (err) {
		console.error(err.messag);
		res.status(500).send('Server Error');
	}
});

// @route GET api/post/:id
// @desc Get post by id
// @access Private

router.get('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			res.status(404).json({ msg: 'Post not found' });
		}
		res.json(post);
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			res.status('404').json({ msg: 'Post not found' });
		}
		res.status(500).send('Serve Error');
	}
});

// @route DELETE api/post/:id
// @desc Delete a post by id
// @access Private

router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			res.status('404').json({ msg: 'Post not found' });
		}

		// check on the user
		if (post.user.toString() !== req.user.id) {
			return res.status(401).json({ msg: 'User not authorized ' });
		}
		await post.remove();

		res.json({ msg: 'Post removed' });
	} catch (err) {
		console.error(err.message);
		if (err.kind === 'ObjectId') {
			res.status('404').json({ msg: 'Post not found' });
		}
		res.status(500).send('Server Error');
	}
});

// @route PUT api/posts/like/:id
// @desc like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Check if the post has been already been liked
		if (post.likes.filter((like) => like.user.toString() === req.user.id).length > 0) {
			return res.status(400).json({ msg: 'Post already liked' });
		}

		post.likes.unshift({ user: req.user.id });

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route POST api/posts/unlike/:id
// @desc Un like a post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// check if the post has already been liked
		if (post.likes.filter((like) => like.user.toString() === req.user.id).length === 0) {
			return res.status(400).json({ msg: 'Post has not yet been liked' });
		}

		// Ger remove index
		const removeIndex = post.likes.map((like) => like.user.toString().indexOf(req.user.id));

		post.likes.splice(removeIndex, 1);

		await post.save();

		res.json(post.likes);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route POST api/post/comment/:id
// @desc Comment on a post
// @access Private

router.post('/comment/:id', [ auth, [ check('text', 'Text is required').not().isEmpty() ] ], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
	}

	try {
		const user = await User.findById(req.user.id).select('-password');
		const post = await Post.findById(req.params.id);

		const newComment = {
			text: req.body.text,
			name: user.name,
			avatar: user.avatar,
			user: req.user.id
		};

		post.comments.unshift(newComment);

		await post.save();

		res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

// @route DELETE api/post/comment/:id/:comment_id
// @desc Comment on a post
// @access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		// Pull out comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

		// Make sure comment exist
		if (!comment) {
			return res.status(404).json({ msg: 'Comment does not exist' });
		}

		// Check user
		if (comment.user.toString() !== req.user.id) {
		  return res.status(401).json({ msg: 'User not authorized' });
        }
        
        // get remove index
		const removeIndex = post.comments.map((comment) => comment.user.toString().indexOf(req.user.id));

		post.comments.splice(removeIndex, 1);

		await post.save();

		res.json(post.comments);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server Error');
	}
});

module.exports = router;
