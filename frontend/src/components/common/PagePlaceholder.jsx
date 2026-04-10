function PagePlaceholder({ description }) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "20px",
        borderRadius: "12px",
        background: "#ffffff",
        border: "1px solid #d9e2ec",
      }}
    >
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  );
}

export default PagePlaceholder;
