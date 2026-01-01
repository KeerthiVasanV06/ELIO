import User from "../models/User.js";
import Blog from "../models/Blog.js";

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch profile" });
	}
};

export const getUsers = async (req, res) => {
	try {
		const users = await User.find().select("-password").sort({ createdAt: -1 });
		res.json(users);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch users" });
	}
};

export const getUserById = async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Failed to fetch user" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.name = req.body.name ?? user.name;
		user.email = req.body.email ?? user.email;

		try {
			const updated = await user.save();
			res.json(updated);
		} catch (err) {
			if (err && err.code === 11000) {
				return res.status(409).json({ message: "Email already in use" });
			}
			throw err;
		}
	} catch (error) {
		res.status(500).json({ message: "Failed to update profile" });
	}
};

export const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			return res
				.status(400)
				.json({ message: "currentPassword and newPassword are required" });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters" });
		}

		const user = await User.findById(req.user._id).select("+password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isMatch = await user.matchPassword(currentPassword);
		if (!isMatch) {
			return res.status(400).json({ message: "Current password is incorrect" });
		}

		user.password = newPassword;
		await user.save();

		res.json({ message: "Password updated successfully" });
	} catch (error) {
		res.status(500).json({ message: "Failed to update password" });
	}
};

export const updateUserRole = async (req, res) => {
	try {
		const { role } = req.body;
		if (!role || !["user", "admin"].includes(role)) {
			return res.status(400).json({ message: "Invalid role" });
		}

		const user = await User.findById(req.params.id).select("-password");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.role = role;
		const updated = await user.save();
		res.json(updated);
	} catch (error) {
		res.status(500).json({ message: "Failed to update user role" });
	}
};

export const deleteUser = async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		await user.deleteOne();
		res.json({ message: "User deleted" });
	} catch (error) {
		res.status(500).json({ message: "Failed to delete user" });
	}
};

export const getUserStats = async (req, res) => {
	try {
		const { userId } = req.params;
		console.log("=== GET USER STATS ===");
		console.log("userId:", userId);
		
		const user = await User.findById(userId)
			.select("-password")
			.populate("bookmarkedBlogs", "title slug views createdAt status");
		
		if (!user) {
			console.log("User not found");
			return res.status(404).json({ message: "User not found" });
		}

		console.log("User found:", user.name);
		console.log("Bookmarked blogs:", user.bookmarkedBlogs?.length);

		// Count published blogs by this user
		const articlesWritten = await Blog.countDocuments({
			author: userId,
			status: "published"
		});

		console.log("Articles written:", articlesWritten);

		// Get bookmarked blogs
		const bookmarkedBlogs = user.bookmarkedBlogs || [];
		const bookmarkedCount = bookmarkedBlogs.length;

		console.log("Bookmarked count:", bookmarkedCount);

		res.json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
				role: user.role
			},
			stats: {
				articlesWritten,
				bookmarked: bookmarkedCount
			},
			bookmarkedBlogs: bookmarkedBlogs
		});
	} catch (error) {
		console.error("Error fetching user stats:", error);
		res.status(500).json({ message: "Failed to fetch user stats", error: error.message });
	}
};

