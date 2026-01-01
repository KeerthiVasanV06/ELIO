import mongoose from "mongoose";
import slugify from "../utils/slugify.js";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    coverImage: {
      type: String,
      default: "",
    },
    
    coverImageData: {
      type: Buffer,
      select: false, // Don't return by default to keep responses light
    },
    
    coverImageType: {
      type: String,
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Category",
},
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    views: {
      type: Number,
      default: 0,
    },

    viewedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        ipAddress: {
          type: String,
          default: null,
        },
        viewedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

blogSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = slugify(this.title);
  }
});


const Blog = mongoose.model("Blog", blogSchema);
export default Blog;
