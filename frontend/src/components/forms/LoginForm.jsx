function LoginForm() {
  return (
    <form
      style={{
        display: "grid",
        gap: "12px",
        maxWidth: "360px",
        padding: "24px",
        borderRadius: "12px",
        background: "#ffffff",
        border: "1px solid #d9e2ec",
      }}
    >
      <p style={{ margin: 0 }}>Placeholder form for future Google OAuth integration.</p>
      <button type="button">Continue with Google</button>
    </form>
  );
}

export default LoginForm;
