import { useEffect, useState } from "react";
import { getCategories } from "../../services/categoryService";
import "./CategorySelect.css";

const CategorySelect = ({ value, onChange, required = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data);
      } catch (err) {
        setError("Failed to load categories");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <select disabled>Loading categories...</select>;
  }

  if (error) {
    return <select disabled>{error}</select>;
  }

  return (
    <select value={value} onChange={onChange} required={required} className="category-select">
      <option value="">Select a category</option>
      {categories.map((cat) => (
        <option key={cat._id} value={cat._id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
};

export default CategorySelect;
