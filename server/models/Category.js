import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = this.name.replace(/\s+/g, "-").toLowerCase();
});

const Category = mongoose.model("Category", categorySchema);
export default Category;
