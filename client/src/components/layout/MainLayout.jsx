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
  ChevronDown,
  BarChart3,
  Building2,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

const navigation = [
  ["Modules", Sparkles, ["saas_super_admin", "company_admin", "admin"]],
  ["Dashboard", LayoutDashboard, ["saas_super_admin", "company_admin", "admin", "store", "production", "production_planner", "production_operator", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"]],
  ["Inward", ArrowDownToLine, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["PO", ShoppingCart, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["PO Pending", Clock3, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Print", Printer, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Stock", Boxes, ["saas_super_admin", "company_admin", "admin", "store", "management", "view_only"]],
  ["History", FileClock, ["saas_super_admin", "company_admin", "admin", "store", "management", "view_only"]],
  ["Master Data", Settings2, ["saas_super_admin", "company_admin", "admin", "store"]],
  ["Masters", Settings2, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "maintenance"]],
  ["Production Planning", ClipboardList, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor"]],
  ["Cutting DC", Scissors, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor"]],
  ["Production Control", Activity, ["saas_super_admin", "company_admin", "admin", "production", "production_operator", "supervisor"]],
  ["Status", Clock3, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "production_operator", "supervisor", "quality", "maintenance", "management", "view_only"]],
  ["Warehouse", Boxes, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "production_operator", "supervisor", "quality", "management", "view_only"]],
  ["Pending & Issues", Wrench, ["saas_super_admin", "company_admin", "admin", "production", "production_planner", "supervisor", "quality", "maintenance", "sewing_coordinator"]],
  ["Sewing Delivery", Scissors, ["saas_super_admin", "company_admin", "admin", "production", "sewing_coordinator"]],
  ["Reports", BarChart3, ["saas_super_admin", "company_admin", "admin", "store", "production", "production_planner", "production_operator", "supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"]],
  ["User Management", Users, ["saas_super_admin", "company_admin", "admin"]],
  ["SaaS Companies", Building2, ["saas_super_admin"]],
];

export default function MainLayout({ page, onPageChange, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mastersOpen, setMastersOpen] = useState(["Production Masters", "Machine Register", "Employee Register"].includes(page));
  const [warehouseOpen, setWarehouseOpen] = useState(["Production Ready", "Rework Warehouse", "Rejection Warehouse", "Balance Elastic", "Section Delivery"].includes(page));
  const { user, logout } = useAuth();

  function selectPage(pageName) {
    onPageChange(pageName);
    setMenuOpen(false);
  }

  function handleLogout() {
    localStorage.removeItem("elastic_production_scan_draft");
    window.history.replaceState({}, "", "/");
    logout();
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
          {navigation.filter(([, , roles]) => roles.includes(user?.role)).map(([name, Icon]) => name === "Masters" ? <div className="nav-group" key={name}>
            <button className={["Production Masters", "Machine Register", "Employee Register"].includes(page) ? "group-active" : ""} onClick={() => setMastersOpen((open) => !open)}><Icon /><span>Masters</span><ChevronDown className={mastersOpen ? "chevron open" : "chevron"} /></button>
            {mastersOpen && <div className="nav-submenu">
              <button className={page === "Production Masters" ? "active" : ""} onClick={() => selectPage("Production Masters")}>Production Master</button>
              <button className={page === "Machine Register" ? "active" : ""} onClick={() => selectPage("Machine Register")}>Machine Register + QR</button>
              <button className={page === "Employee Register" ? "active" : ""} onClick={() => selectPage("Employee Register")}>Employee Register + QR</button>
            </div>}
          </div> : name === "Warehouse" ? <div className="nav-group" key={name}>
            <button className={["Production Ready", "Rework Warehouse", "Rejection Warehouse", "Balance Elastic", "Section Delivery"].includes(page) ? "group-active" : ""} onClick={() => setWarehouseOpen((open) => !open)}><Icon /><span>Warehouse</span><ChevronDown className={warehouseOpen ? "chevron open" : "chevron"} /></button>
            {warehouseOpen && <div className="nav-submenu">
              <button className={page === "Production Ready" ? "active" : ""} onClick={() => selectPage("Production Ready")}>Production Ready</button>
              <button className={page === "Rework Warehouse" ? "active" : ""} onClick={() => selectPage("Rework Warehouse")}>Rework</button>
              <button className={page === "Rejection Warehouse" ? "active" : ""} onClick={() => selectPage("Rejection Warehouse")}>Rejection</button>
              <button className={page === "Balance Elastic" ? "active" : ""} onClick={() => selectPage("Balance Elastic")}>Balance Elastic</button>
              <button className={page === "Section Delivery" ? "active" : ""} onClick={() => selectPage("Section Delivery")}>Section Delivery</button>
            </div>}
          </div> : <button className={page === name ? "active" : ""} key={name} onClick={() => selectPage(name)}><Icon />{name}</button>)}
        </nav>

        <div className="profile">
          <div>
            <b>{user?.name}</b>
            <small>{user?.role}</small>
          </div>
          <button onClick={handleLogout}>
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
            <h1>{page === "Production Dashboard" ? "Dashboard" : page}</h1>
          </div>
        </header>

        <div className="page">{children}</div>
      </main>
    </div>
  );
}
