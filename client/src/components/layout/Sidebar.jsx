import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Clock3,
  FileClock,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const links = [
  ["Dashboard", LayoutDashboard],
  ["Inward", ArrowDownToLine],
  ["PO", ShoppingCart],
  ["PO Pending", Clock3],
  ["Outward", ArrowUpFromLine],
  ["Stock", Boxes],
  ["History", FileClock],
  ["Master Data", Settings2],
];

export default function Sidebar({ page, open, onSelect, onClose }) {
  const { user, logout } = useAuth();
  return (
    <aside className={open ? "open" : ""}>
      <div className="brand">
        <span>
          <Sparkles />
        </span>
        <div>
          <b>YarnFlow</b>
          <small>STORE MANAGER</small>
        </div>
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      <nav>
        {links.map(([name, Icon]) => (
          <button
            key={name}
            className={page === name ? "active" : ""}
            onClick={() => onSelect(name)}
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
  );
}
