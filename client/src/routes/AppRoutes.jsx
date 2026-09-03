import DashboardPage from "../pages/dashboard/DashboardPage.jsx";
import HistoryPage from "../pages/history/HistoryPage.jsx";
import InwardPage from "../pages/inward/InwardPage.jsx";
import ItemMasterPage from "../pages/master/ItemMasterPage.jsx";
import OutwardPage from "../pages/outward/OutwardPage.jsx";
import PurchaseOrderPage from "../pages/purchase-order/PurchaseOrderPage.jsx";
import StockPage from "../pages/stock/StockPage.jsx";

export default function AppRoutes({ page, notify }) {
  switch (page) {
    case "Inward":
      return <InwardPage notify={notify} />;
    case "PO":
      return <PurchaseOrderPage pending={false} notify={notify} />;
    case "PO Pending":
      return <PurchaseOrderPage pending notify={notify} />;
    case "Outward":
      return <OutwardPage notify={notify} />;
    case "Stock":
      return <StockPage />;
    case "History":
      return <HistoryPage />;
    case "Master Data":
      return <ItemMasterPage notify={notify} />;
    default:
      return <DashboardPage />;
  }
}
