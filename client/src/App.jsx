import { useEffect, useState } from "react";
import MainLayout from "./components/layout/MainLayout.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import PublicOutwardPage from "./pages/outward/PublicOutwardPage.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function Application() {
  const { token, user } = useAuth();
  const adminRoles = ["saas_super_admin", "company_admin", "admin"];
  const [page, setPage] = useState(
    window.location.pathname === "/production"
      ? "Production Control"
      : adminRoles.includes(user?.role)
        ? "Modules"
        : user?.role?.includes("production")
          ? "Production Dashboard"
          : "Dashboard",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token || !user) return;
    const nextPage = window.location.pathname === "/production"
      ? "Production Control"
      : adminRoles.includes(user.role)
        ? "Modules"
        : user.role?.includes("production") || ["supervisor", "quality", "maintenance", "sewing_coordinator", "management", "view_only"].includes(user.role)
          ? "Production Dashboard"
          : "Dashboard";
    setPage(nextPage);
  }, [token, user?._id, user?.role]);

  function notify(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  if (!token) return <LoginPage />;

  return (
    <>
      <MainLayout page={page} onPageChange={setPage}>
        <AppRoutes page={page} notify={notify} onPageChange={setPage} />
      </MainLayout>

      {message && <div className="toast">{message}</div>}
    </>
  );
}

export default function App() {
  const inwardNo = new URLSearchParams(window.location.search).get("inwardNo");

  if (window.location.pathname === "/outward" && inwardNo) {
    return <PublicOutwardPage inwardNo={inwardNo} />;
  }

  return (
    <AuthProvider>
      <Application />
    </AuthProvider>
  );
}
