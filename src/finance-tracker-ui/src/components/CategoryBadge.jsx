const CategoryBadge = ({ category }) => {
  if (!category) return null;

  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
      style={{
        backgroundColor: category.color ? `${category.color}20` : '#f3f4f6',
        color: category.color || '#374151',
      }}
    >
      {category.icon && <span className="mr-1">{category.icon}</span>}
      {category.name}
    </span>
  );
};

export default CategoryBadge;
