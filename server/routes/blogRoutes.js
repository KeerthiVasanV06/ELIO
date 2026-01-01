import express from "express";
import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  bookmarkBlog,
  unbookmarkBlog,
  getUserLikes,
  getUserBookmarks,
  getBookmarkedBlogsDetails,
  getBlogsByAuthor,
  getBlogImage,
} from "../controllers/blogController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/:id/image", getBlogImage);

router.get("/user/likes", authMiddleware, getUserLikes);
router.get("/user/bookmarks", authMiddleware, getUserBookmarks);
router.get("/user/bookmarks-details", authMiddleware, getBookmarkedBlogsDetails);

router.get("/author/:authorId", getBlogsByAuthor);

router.get("/", getAllBlogs);

router.get("/:slug", getSingleBlog);

router.post(
  "/",
  authMiddleware,
  (req, res, next) => {
    console.log("=== BLOG POST REQUEST ===");
    console.log("Headers:", req.headers);
    console.log("Body before multer:", req.body);
    next();
  },
  upload.single("coverImage"),
  (req, res, next) => {
    console.log("Body after multer:", req.body);
    console.log("Tags in body:", req.body.tags);
    console.log("Tags type:", typeof req.body.tags);
    next();
  },
  createBlog
);

router.put(
  "/:id",
  authMiddleware,
  upload.single("coverImage"),
  updateBlog
);

router.delete("/:id", authMiddleware, deleteBlog);

router.post("/:id/like", authMiddleware, likeBlog);
router.post("/:id/unlike", authMiddleware, unlikeBlog);
router.post("/:id/bookmark", authMiddleware, bookmarkBlog);
router.post("/:id/unbookmark", authMiddleware, unbookmarkBlog);

export default router;
