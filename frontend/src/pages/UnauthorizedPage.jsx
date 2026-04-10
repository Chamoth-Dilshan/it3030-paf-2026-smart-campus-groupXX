function UnauthorizedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f7f8fa",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>Unauthorized</h1>
        <p>This placeholder page will be used for access control failures.</p>
      </div>
    </div>
  );
}

export default UnauthorizedPage;
