import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../services/blogService";
import "./AuthorCard.css";

const AuthorCard = ({ author }) => {
  if (!author || typeof author === "string") return null;

  const navigate = useNavigate();
  const authorName = author.name || "Unknown Author";

  const handleAuthorClick = () => {
    navigate(`/profile/${author._id}`);
  };

  const authorAvatar = author.avatar ? getImageUrl(author.avatar) : "";

  return (
    <div className="author-minimal-card">
      <div className="author-minimal-content" onClick={handleAuthorClick}>
        <div className="author-minimal-avatar">
          {authorAvatar ? (
            <img
              src={authorAvatar}
              alt={authorName}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="avatar-placeholder">
              {authorName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h4 className="author-minimal-name">{authorName}</h4>
      </div>
    </div>
  );
};

export default AuthorCard;
