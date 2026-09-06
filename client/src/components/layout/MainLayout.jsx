import {
  AlertTriangle,
  ArrowDownToLine,
  Boxes,
  Clock3,
  FileClock,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShoppingCart,
  Printer,
  Activity,
  Factory,
  Wrench,
  Scissors,
  Users,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  ["Dashboard", LayoutDashboard, ["admin", "store", "production"]],
  ["Inward", ArrowDownToLine, ["admin", "store"]],
  ["PO", ShoppingCart, ["admin", "store"]],
  ["PO Pending", Clock3, ["admin", "store"]],
  ["Print", Printer, ["admin", "store"]],
  ["Stock", Boxes, ["admin", "store"]],
  ["History", FileClock, ["admin", "store"]],
  ["Master Data", Settings2, ["admin", "store"]],
  ["Production Control", Activity, ["admin", "production"]],
  ["Production Dashboard", LayoutDashboard, ["admin"]],
  ["Machine & Employee", Factory, ["admin", "production"]],
  ["Pending & Issues", Wrench, ["admin", "production"]],
  ["Sewing Delivery", Scissors, ["admin", "production"]],
  ["User Management", Users, ["admin"]],
];

export default function MainLayout({ page, onPageChange, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  function selectPage(pageName) {
    onPageChange(pageName);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={menuOpen ? "open" : ""}>
        <div className="brand">
          <span className="brand-icon">
            <Sparkles />
          </span>
          <div className="brand-copy">
            <b className="brand-title">Accessories Flow</b>
            <small className="brand-subtitle">ACCESSORIES MANAGER</small>
          </div>
          <button className="brand-close" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>

        <nav>
          {navigation.filter(([, , roles]) => roles.includes(user?.role)).map(([name, Icon]) => (
            <button
              className={page === name ? "active" : ""}
              key={name}
              onClick={() => selectPage(name)}
            >
              <Icon />
              {name}
            </button>
          ))}
        </nav>

        <div className="profile">
          <div>
            <b>{user?.name}</b>
            <small>{user?.role}</small>
          </div>
          <button onClick={logout}>
            <LogOut />
          </button>
        </div>
      </aside>

      {menuOpen && <div className="shade" onClick={() => setMenuOpen(false)} />}

      <main>
        <header className="topbar">
          <button className="menu" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div>
            <small>{user?.role === "production" ? "Elastic Production" : "Accessories Store"}</small>
            <h1>{page}</h1>
          </div>
        </header>

        <div className="page">{children}</div>
      </main>
    </div>
  );
}
