import express from "express";
import path from "path";
import cors from "cors";
import session from "express-session";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

// Allow frontend to access the API
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Debug middleware for FormData
app.use((req, res, next) => {
  if (req.method === "POST" && req.path.includes("/blogs")) {
    console.log("=== REQUEST DEBUG ===");
    console.log("Path:", req.path);
    console.log("Method:", req.method);
    console.log("Content-Type:", req.headers["content-type"]);
  }
  next();
});

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Blog API is running");
});

app.use(errorMiddleware);

export default app;
