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
  ClipboardList,
  BarChart3,
  Building2,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  ["Dashboard", LayoutDashboard, ["saas_super_admin", "company_admin", "admin", "store", "production", "production_planner", "production_operator", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"]],
  ["Inward", ArrowDownToLine, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["PO", ShoppingCart, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["PO Pending", Clock3, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Print", Printer, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Stock", Boxes, ["saas_super_admin", "company_admin", "admin", "store", "management", "view_only"]],
  ["History", FileClock, ["saas_super_admin", "company_admin", "admin", "store", "management", "view_only"]],
  ["Master Data", Settings2, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Production Masters", Settings2, ["saas_super_admin", "company_admin", "admin", "store", "production", "production_planner"]],
  ["Production Planning", ClipboardList, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor"]],
  ["Production Control", Activity, ["saas_super_admin", "company_admin", "admin", "production", "production_operator", "supervisor"]],
  ["Production Dashboard", LayoutDashboard, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor", "quality", "maintenance", "management", "view_only"]],
  ["Machine & Employee", Factory, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "maintenance"]],
  ["Pending & Issues", Wrench, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor", "quality", "maintenance", "sewing_coordinator"]],
  ["Sewing Delivery", Scissors, ["saas_super_admin", "company_admin", "admin", "production", "sewing_coordinator"]],
  ["Reports & Traceability", BarChart3, ["saas_super_admin", "company_admin", "admin", "production_planner", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"]],
  ["User Management", Users, ["saas_super_admin", "company_admin", "admin"]],
  ["SaaS Companies", Building2, ["saas_super_admin"]],
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
            <small>{user?.role?.includes("production") ? "Elastic Production" : "Accessories Flow SaaS"}</small>
            <h1>{page}</h1>
          </div>
        </header>

        <div className="page">{children}</div>
      </main>
    </div>
  );
}
