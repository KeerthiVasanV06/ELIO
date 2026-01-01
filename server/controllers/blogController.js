import Blog from "../models/Blog.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const createBlog = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;

    console.log("=== CREATE BLOG ===");
    console.log("Raw request body:", req.body);
    console.log("Tags value:", tags);
    console.log("Tags type:", typeof tags);

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    let normalizedTags = [];
    
    if (tags !== undefined && tags !== null && tags !== "") {
      console.log("Processing tags...");
      
      if (typeof tags === "string") {
        normalizedTags = tags
          .split(",")
          .map(t => t.trim())
          .filter(t => t.length > 0);
        console.log("Parsed from string:", normalizedTags);
      } else if (Array.isArray(tags)) {
        normalizedTags = tags.filter(t => t && t.length > 0);
        console.log("Used array:", normalizedTags);
      }
    }

    console.log("Final normalized tags:", normalizedTags);

    const blogData = {
      title: title.trim(),
      content: content.trim(),
      tags: normalizedTags,
      status: status || "draft",
      author: req.user._id,
      coverImage: "", // Will be set after save if needed, or we can use placeholder
    };

    if (req.file) {
      blogData.coverImageData = req.file.buffer;
      blogData.coverImageType = req.file.mimetype;
      // We can't set the final URL with ID until we have the ID.
      // But we can set a placeholder or update it after creation.
      // Let's rely on the router to serve /api/blogs/:id/image
    }

    if (category && String(category).trim() && category !== "null") {
      blogData.category = category;
    }

    console.log("Final blog data to save:", JSON.stringify(blogData, null, 2));

    const blog = await Blog.create(blogData);
    
    if (req.file) {
      blog.coverImage = `/api/blogs/${blog._id}/image`;
      await blog.save();
    }

    console.log("Blog created successfully:");
    console.log("Stored tags in DB:", blog.tags);
    console.log("Blog object:", JSON.stringify(blog, null, 2));

    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ error: "Failed to create blog" });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ status: "published" })
      .populate("author", "name email avatar")
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Blog.countDocuments({ status: "published" });

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      blogs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    let blog = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name email avatar bio _id")
      .populate("category", "name")
      .populate("likes", "_id");

    if (!blog || blog.status !== "published") {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user?._id || null;
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.connection.remoteAddress || "unknown";

    console.log("=== VIEW TRACKING ===");
    console.log("Blog ID:", blog._id);
    console.log("Blog:", blog.title);
    console.log("User ID:", userId);
    console.log("IP Address:", ipAddress);
    console.log("Current views before:", blog.views);
    console.log("ViewedBy count before:", blog.viewedBy?.length || 0);

    let hasViewed = false;

    if (userId) {
      console.log("Checking authenticated user views");
      hasViewed = blog.viewedBy?.some(view => {
        const viewUserId = view.userId?.toString();
        const currentUserId = userId.toString();
        return viewUserId === currentUserId;
      });
    } else {
      console.log("Checking anonymous user views");
      hasViewed = blog.viewedBy?.some(view => {
        return !view.userId && view.ipAddress === ipAddress;
      });
    }

    console.log("Has viewed before:", hasViewed);

    if (!hasViewed) {
      console.log("New viewer! Incrementing views...");
      
      await Blog.updateOne(
        { _id: blog._id },
        {
          $inc: { views: 1 },
          $push: {
            viewedBy: {
              userId: userId || null,
              ipAddress: userId ? null : ipAddress,
              viewedAt: new Date(),
            }
          }
        }
      );
      
      console.log("Database updated, incrementing local views");
      blog.views = (blog.views || 0) + 1;
      console.log("View count after increment:", blog.views);
    } else {
      console.log("Returning cached blog data, views not incremented");
    }

    res.json(blog);
  } catch (error) {
    console.error("Error getting single blog:", error);
    res.status(500).json({ message: "Failed to fetch blog" });
  }
};


export const updateBlog = async (req, res) => {
  try {
    console.log("=== UPDATE BLOG ===");
    console.log("Blog ID:", req.params.id);
    console.log("User ID:", req.user._id);
    console.log("Body:", req.body);
    console.log("File:", req.file);
    
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      console.log("Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog found:", blog.title);
    console.log("Blog author:", blog.author);

    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      console.log("Not authorized");
      return res.status(403).json({ message: "Not authorized" });
    }

    blog.title = req.body.title || blog.title;
    blog.content = req.body.content || blog.content;
    blog.status = req.body.status || blog.status;
    
    if (req.body.tags) {
      if (typeof req.body.tags === "string") {
        blog.tags = req.body.tags.split(",").map(tag => tag.trim()).filter(t => t.length > 0);
      } else if (Array.isArray(req.body.tags)) {
        blog.tags = req.body.tags;
      }
    }
    if (req.body.category && req.body.category.trim()) {
      blog.category = req.body.category;
    } else if (req.body.category === "") {
      blog.category = null;
    }

    if (req.file) {
      blog.coverImageData = req.file.buffer;
      blog.coverImageType = req.file.mimetype;
      blog.coverImage = `/api/blogs/${blog._id}/image`;
    }

    console.log("Saving blog with updates:", {
      title: blog.title,
      status: blog.status,
      tags: blog.tags,
      category: blog.category
    });

    const updatedBlog = await blog.save();
    console.log("Blog updated successfully");
    res.json(updatedBlog);
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(500).json({ message: "Failed to update blog", error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (
      blog.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await blog.deleteOne();
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete blog" });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.likes.includes(userId)) {
      return res.status(400).json({ message: "Blog already liked" });
    }

    blog.likes.push(userId);
    await blog.save();

    const user = await User.findById(userId);
    if (!user.likedBlogs.includes(id)) {
      user.likedBlogs.push(id);
      await user.save();
    }

    const updatedBlog = await Blog.findById(id)
      .populate("likes", "_id")
      .populate("author", "name email avatar bio _id")
      .populate("category", "name");

    res.json({ 
      message: "Blog liked successfully", 
      liked: true,
      blog: updatedBlog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to like blog" });
  }
};

export const unlikeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.likes = blog.likes.filter(likeId => likeId.toString() !== userId.toString());
    await blog.save();
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { likedBlogs: id } },
      { new: true }
    );
    const updatedBlog = await Blog.findById(id)
      .populate("likes", "_id")
      .populate("author", "name email avatar bio _id")
      .populate("category", "name");

    res.json({ 
      message: "Blog unliked successfully", 
      liked: false,
      blog: updatedBlog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to unlike blog" });
  }
};

export const bookmarkBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log("=== BOOKMARK BLOG ===");
    console.log("Blog ID from params:", id);
    console.log("User ID:", userId);
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    const blogObjectId = new mongoose.Types.ObjectId(id);
    console.log("Converted blog ObjectId:", blogObjectId);

    const blog = await Blog.findById(blogObjectId);
    if (!blog) {
      console.log("Blog not found with ID:", blogObjectId);
      return res.status(404).json({ message: "Blog not found" });
    }

    console.log("Blog found:", blog.title);

    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user.email);
    console.log("Current bookmarkedBlogs:", user.bookmarkedBlogs);
    const isAlreadyBookmarked = user.bookmarkedBlogs.some(
      (bookmarkedId) => bookmarkedId.toString() === blogObjectId.toString()
    );

    if (isAlreadyBookmarked) {
      console.log("Blog already bookmarked");
      return res.status(400).json({ message: "Blog already bookmarked" });
    }

    user.bookmarkedBlogs.push(blogObjectId);
    console.log("Bookmarked blogs after push:", user.bookmarkedBlogs);
    
    await user.save();
    console.log("User saved successfully");

    res.json({ message: "Blog bookmarked successfully", bookmarked: true });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ message: "Failed to bookmark blog" });
  }
};

export const unbookmarkBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    console.log("=== UNBOOKMARK BLOG ===");
    console.log("Blog ID from params:", id);
    console.log("User ID:", userId);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid blog ID format" });
    }

    const blogObjectId = new mongoose.Types.ObjectId(id);

    const blog = await Blog.findById(blogObjectId);
    if (!blog) {
      console.log("Blog not found with ID:", blogObjectId);
      return res.status(404).json({ message: "Blog not found" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookmarkedBlogs: blogObjectId } },
      { new: true }
    );

    console.log("User after unbookmark:", user?.bookmarkedBlogs?.length || 0, "bookmarks");
    res.json({ message: "Blog unbookmarked successfully", bookmarked: false });
  } catch (error) {
    console.error("Unbookmark error:", error);
    res.status(500).json({ message: "Failed to unbookmark blog" });
  }
};

export const getUserLikes = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("likedBlogs", "_id");

    res.json({
      likedBlogIds: user.likedBlogs.map(blog => blog._id.toString()),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch liked blogs" });
  }
};

export const getUserBookmarks = async (req, res) => {
  try {
    console.log("=== GET USER BOOKMARKS ===");
    console.log("User ID:", req.user._id);
    
    const user = await User.findById(req.user._id).populate("bookmarkedBlogs", "_id");
    
    console.log("User found:", user?.email);
    console.log("Bookmarked blog IDs count:", user?.bookmarkedBlogs?.length || 0);

    res.json({
      bookmarkedBlogIds: user.bookmarkedBlogs.map(blog => blog._id.toString()),
    });
  } catch (error) {
    console.error("Get user bookmarks error:", error);
    res.status(500).json({ message: "Failed to fetch bookmarked blogs" });
  }
};

export const getBookmarkedBlogsDetails = async (req, res) => {
  try {
    console.log("=== GET BOOKMARKED BLOGS DETAILS ===");
    console.log("User ID:", req.user._id);

    const user = await User.findById(req.user._id)
      .populate({
        path: "bookmarkedBlogs",
        match: { status: "published" },
        select: "title slug content coverImage author category createdAt views",
        populate: [
          { path: "author", select: "name avatar email" },
          { path: "category", select: "name" }
        ]
      });

    console.log("User found:", user?.email);
    console.log("Bookmarked blogs count:", user?.bookmarkedBlogs?.length || 0);
    
    if (user?.bookmarkedBlogs?.length > 0) {
      console.log("Bookmarked blogs:", user.bookmarkedBlogs.map(b => b.title));
    }

    const bookmarkedBlogs = user.bookmarkedBlogs || [];

    res.json({
      blogs: bookmarkedBlogs,
      count: bookmarkedBlogs.length,
    });
  } catch (error) {
    console.error("Get bookmarked blogs error:", error);
    res.status(500).json({ message: "Failed to fetch bookmarked blogs" });
  }
};

export const getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;

    const blogs = await Blog.find({ author: authorId })
      .populate("author", "name email")
      .populate("category", "name")
      .select("title slug content coverImage status views createdAt updatedAt")
      .sort({ createdAt: -1 });

    res.json({
      blogs,
      count: blogs.length,
    });
  } catch (error) {
    console.error("Get author blogs error:", error);
    res.status(500).json({ message: "Failed to fetch author's blogs" });
  }
};

export const getBlogImage = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).select("coverImageData coverImageType");

    if (!blog || !blog.coverImageData) {
      // Return 404 or a default image
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", blog.coverImageType);
    res.send(blog.coverImageData);
  } catch (error) {
    console.error("Error fetching blog image:", error);
    res.status(500).send("Error fetching image");
  }
};
