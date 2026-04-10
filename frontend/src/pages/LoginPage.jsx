import LoginForm from "../components/forms/LoginForm";

function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f0f4f8",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div>
        <h1>Login</h1>
        <p>Starter page for campus user authentication.</p>
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;
