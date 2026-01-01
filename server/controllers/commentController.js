import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";

export const addComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    const blogId = req.params.blogId || req.body.blogId;

    if (!content || !blogId) {
      return res.status(400).json({
        message: "Content and blogId are required",
      });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (!parent) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      content,
      blog: blogId,
      author: req.user._id,
      parentComment: parentComment || null,
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("ADD COMMENT ERROR:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

export const getCommentsByBlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await Comment.find({ blog: blogId })
      .populate("author", "name _id")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    console.error("GET COMMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      comment.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Comment.deleteMany({ parentComment: comment._id });
    await comment.deleteOne();

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
