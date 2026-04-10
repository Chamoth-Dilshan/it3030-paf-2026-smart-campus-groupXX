import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const links = [
  { label: "Dashboard", to: ROUTES.DASHBOARD },
  { label: "Resources", to: ROUTES.RESOURCES },
  { label: "Bookings", to: ROUTES.MY_BOOKINGS },
  { label: "Tickets", to: ROUTES.MY_TICKETS },
  { label: "Admin", to: ROUTES.ADMIN_BOOKING_APPROVALS },
  { label: "Technician", to: ROUTES.TECHNICIAN_QUEUE },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "240px",
        padding: "24px 16px",
        background: "#102a43",
        color: "#ffffff",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Campus Hub</h2>
      <p style={{ color: "#cbd2d9", fontSize: "14px" }}>Navigation placeholder</p>
      <nav style={{ display: "grid", gap: "8px", marginTop: "24px" }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              color: "#ffffff",
              textDecoration: "none",
              padding: "10px 12px",
              borderRadius: "8px",
              background: isActive ? "#243b53" : "transparent",
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
