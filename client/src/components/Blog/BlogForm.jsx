import { useState } from "react";
import CategorySelect from "../CategorySelect/CategorySelect";
import "./BlogForm.css";

const BlogForm = ({ onSubmit, initialData = {}, loading }) => {
  const [form, setForm] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    coverImage: initialData.coverImage instanceof File ? initialData.coverImage : null,
    category: initialData.category?._id || initialData.category || "",
    tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
    status: initialData.status || "draft",
  });

  const [tagInput, setTagInput] = useState("");

  const [coverPreview, setCoverPreview] = useState(
    typeof initialData.coverImage === "string" ? initialData.coverImage : ""
  );
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image must be less than 10MB");
        return;
      }
      setForm({ ...form, coverImage: file });
      setCoverPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleAddTag = () => {
    const cleanedTag = tagInput.replace(/^#/, "").trim().toLowerCase();

    console.log("Adding tag - Raw input:", tagInput, "Cleaned:", cleanedTag);

    if (!cleanedTag) {
      console.log("Tag is empty after cleaning, skipping");
      return;
    }

    if (form.tags.includes(cleanedTag)) {
      console.log("Tag already exists:", cleanedTag);
      setTagInput("");
      return;
    }

    console.log("Adding new tag:", cleanedTag);
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
    console.log("Removing tag:", tagToRemove);
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

    console.log("=== BLOG FORM SUBMIT ===");
    console.log("Form tags:", form.tags);
    console.log("Form tags type:", typeof form.tags);
    console.log("Form tags length:", form.tags.length);
    console.log("Full form object:", form);

    const payload = {
      ...form,
      title: form.title.trim(),
      content: form.content.trim(),
    };

    console.log("Payload being sent:", payload);

    onSubmit(payload);
  };

  return (
    <form className="blog-form" onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}

      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          name="title"
          placeholder="Blog title"
          value={form.title}
          onChange={handleChange}
          maxLength={150}
          required
        />
        <small>{form.title.length}/150</small>
      </div>

      <div className="form-group">
        <label htmlFor="content">Content *</label>
        <textarea
          id="content"
          name="content"
          placeholder="Write your blog content..."
          value={form.content}
          onChange={handleChange}
          rows={10}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="coverImage">Cover Image</label>
        <input
          id="coverImage"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
        />
        {coverPreview && (
          <div className="cover-preview">
            <img src={coverPreview} alt="Cover preview" />
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Tags</label>
        <div className="tag-input-wrapper">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Enter tag and press Enter (e.g., jjk, anime)"
            className="tag-input"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="add-tag-btn"
          >
            Add Tag
          </button>
        </div>

        {form.tags.length > 0 && (
          <div className="tag-list">
            {form.tags.map((tag, index) => (
              <div key={index} className="tag-chip">
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="status">Status *</label>
        <select id="status" name="status" value={form.status} onChange={handleChange}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Saving..." : "Save Blog"}
      </button>
    </form>
  );
};

export default BlogForm;
