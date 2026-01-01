import { useState, useEffect } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import "./EditBlogCard.css";

const EditBlogCard = ({ blog, onSave, onCancel, loading }) => {
  const [form, setForm] = useState({
    title: blog.title || "",
    content: blog.content || "",
    category: blog.category?._id || blog.category || "",
    tags: Array.isArray(blog.tags) ? [...blog.tags] : [],
    status: blog.status || "draft",
    coverImage: null, // File object if user uploads new one
  });

  const [tagInput, setTagInput] = useState("");
  const [coverPreview, setCoverPreview] = useState(
    blog.coverImage || ""
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      setForm((prev) => ({
        ...prev,
        coverImage: file,
      }));
      setCoverPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleAddTag = () => {
    const cleanedTag = tagInput.replace(/^#/, "").trim().toLowerCase();

    if (!cleanedTag) {
      return;
    }

    if (form.tags.includes(cleanedTag)) {
      setTagInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, cleanedTag],
    }));

    setTagInput("");
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!form.content.trim()) {
      setError("Content is required");
      return;
    }

    const submitData = {
      title: form.title,
      content: form.content,
      category: form.category || undefined,
      tags: form.tags,
      status: form.status,
    };

    // Only include coverImage if a new one was selected
    if (form.coverImage instanceof File) {
      submitData.coverImage = form.coverImage;
    }

    onSave(submitData);
  };

  return (
    <form className="edit-blog-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      {/* Title */}
      <div className="form-group">
        <label htmlFor="title">Blog Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          maxLength={150}
        />
      </div>

      {/* Content */}
      <div className="form-group">
        <label htmlFor="content">Blog Content *</label>
        <textarea
          id="content"
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write your blog content here..."
          rows={8}
        />
      </div>

      {/* Category */}
      <div className="form-group">
        <label htmlFor="category">Category</label>
        <CategorySelect
          value={form.category}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              category: value,
            }))
          }
        />
      </div>

      {/* Cover Image */}
      <div className="form-group">
        <label htmlFor="coverImage">Cover Image</label>
        <div className="image-upload-section">
          {coverPreview && (
            <div className="image-preview">
              <img src={coverPreview} alt="Preview" />
              <p className="preview-label">Current/New Cover</p>
            </div>
          )}
          <input
            id="coverImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file-input"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="form-group">
        <label htmlFor="tagInput">Tags</label>
        <div className="tag-input-section">
          <input
            id="tagInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag and press Enter or click Add Tag"
          />
          <button
            type="button"
            className="add-tag-btn"
            onClick={handleAddTag}
          >
            Add Tag
          </button>
        </div>

        {form.tags.length > 0 && (
          <div className="tags-display">
            {form.tags.map((tag) => (
              <div key={tag} className="tag-chip">
                <span className="tag-text">#{tag}</span>
                <button
                  type="button"
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(tag)}
                  title="Remove tag"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Form Actions */}
      <div className="form-actions">
        <button
          type="button"
          className="cancel-btn"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="save-btn"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default EditBlogCard;
