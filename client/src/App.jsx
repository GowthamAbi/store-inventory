import { useState } from "react";
import MainLayout from "./components/layout/MainLayout.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import PublicOutwardPage from "./pages/outward/PublicOutwardPage.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

function Application() {
  const { token } = useAuth();
  const [page, setPage] = useState(
    window.location.pathname === "/production" ? "Production Control" : "Dashboard",
  );
  const [message, setMessage] = useState("");

  function notify(text) {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  }

  if (!token) return <LoginPage />;

  return (
    <>
      <MainLayout page={page} onPageChange={setPage}>
        <AppRoutes page={page} notify={notify} />
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
