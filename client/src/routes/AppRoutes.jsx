import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import HistoryPage from "../pages/history/HistoryPage.jsx";
import InwardPage from "../pages/inward/InwardPage.jsx";
import ItemMasterPage from "../pages/master/ItemMasterPage.jsx";
import PrintPage from "../pages/print/PrintPage.jsx";
import PurchaseOrderPage from "../pages/purchase-order/PurchaseOrderPage.jsx";
import StockPage from "../pages/stock/StockPage.jsx";
import PendingPage from "../pages/production/PendingPage.jsx";
import ProductionControlPage from "../pages/production/ProductionControlPage.jsx";
import ProductionDashboardPage from "../pages/production/ProductionDashboardPage.jsx";
import ProductionSetupPage from "../pages/production/ProductionSetupPage.jsx";
import SewingDeliveryPage from "../pages/production/SewingDeliveryPage.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import UserManagementPage from "../pages/auth/UserManagementPage.jsx";

export default function AppRoutes({ page, notify }) {
  const { user } = useAuth();
  switch (page) {
    case "Inward":
      return <InwardPage notify={notify} />;
    case "PO":
      return <PurchaseOrderPage pending={false} notify={notify} />;
    case "PO Pending":
      return <PurchaseOrderPage pending notify={notify} />;
    case "Print":
      return <PrintPage notify={notify} />;
    case "Stock":
      return <StockPage />;
    case "History":
      return <HistoryPage />;
    case "Master Data":
      return <ItemMasterPage notify={notify} />;
    case "Production Control":
      return <ProductionControlPage notify={notify} />;
    case "Production Dashboard":
      return <ProductionDashboardPage />;
    case "Machine & Employee":
      return <ProductionSetupPage notify={notify} />;
    case "Pending & Issues":
      return <PendingPage notify={notify} />;
    case "Sewing Delivery":
      return <SewingDeliveryPage notify={notify} />;
    case "User Management":
      return <UserManagementPage notify={notify} />;
    default:
      return user?.role === "production"
        ? <ProductionDashboardPage />
        : <DashboardPage />;
  }
}
