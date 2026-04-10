import Sidebar from "../components/common/Sidebar";
import NotificationDrawer from "../components/ui/NotificationDrawer";

const contentStyle = {
  flex: 1,
  padding: "24px",
  background: "#f7f8fa",
  minHeight: "100vh",
};

function MainLayout({ title, children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      <Sidebar />
      <main style={contentStyle}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>{title}</h1>
            <p style={{ color: "#54606f" }}>Starter placeholder view for this module.</p>
          </div>
          <NotificationDrawer />
        </header>
        <section>{children}</section>
      </main>
    </div>
  );
}

export default MainLayout;
