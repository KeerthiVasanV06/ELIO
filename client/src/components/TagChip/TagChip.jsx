import "./TagChip.css";

const TagChip = ({ tag, onRemove }) => {
  return (
    <span className="tag-chip">
      {tag}
      {onRemove && (
        <button
          type="button"
          className="tag-remove"
          onClick={() => onRemove(tag)}
          aria-label={`Remove tag ${tag}`}
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default TagChip;
