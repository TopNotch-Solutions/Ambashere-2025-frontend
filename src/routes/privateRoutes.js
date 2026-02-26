import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from "./protectedRoutes.js";

// Common Pages
import Settings from "../pages/global/settings/Settings.jsx";
import NotificationPage from "../pages/global/notifications/NotificationPage.jsx";

// Admin Pages
import AdminDashboard from "../pages/admin/dashboard/Dashboard.jsx";
import AdminCalendar from "../pages/admin/calendar/Calendar.jsx";
import Employees from "../pages/admin/employees/Employees.jsx";
import AdminProfileCard from "../pages/admin/profile/Profile.jsx";
import AdminReports from "../pages/admin/reports/Reports.jsx";
import AdminContracts from "../pages/admin/contracts/Contracts.jsx";
import AdminPackages from "../pages/admin/packages/Packages.jsx";
import AdminUploadPage from "../pages/admin/upload/UploadVoucher.jsx";
import AdminHandsets from "../pages/admin/handsets/Handsets.jsx";
import StaffDetails from "../pages/admin/staff/StaffDetails.jsx";
import Personal from "../pages/admin/staff/Personal.jsx";
import AirtimeBenefits from "../pages/admin/staff/AirtimeBenefits.jsx";
import HandsetBenefits from "../pages/admin/staff/HandsetBenefits.jsx";

// User Pages
import UserDashboard from "../pages/user/dashboard/Dashboard.jsx";
import UserCalendar from "../pages/user/calendar/Calendar.jsx";
import UserProfileCard from "../pages/user/profile/Profile.jsx";
import UserBenefits from "../pages/user/benefits/Benefits.jsx";
import UserHandsets from "../pages/user/handsets/Handsets.jsx";
import UserAirtime from "../pages/user/airtime/Airtime.jsx";
import SelfHelp from "../pages/user/self-help/SelfHelp.jsx";
// import FAQs from "../pages/user/self-help/FAQs.jsx";
// import Videos from "../pages/user/self-help/Videos.jsx";
// import Wellness from "../pages/user/self-help/Wellness.jsx";
// import Compensation from "../pages/user/self-help/Compensation.jsx";
// import WorkEnvironment from "../pages/user/self-help/WorkEnvironment.jsx";
// import Career from "../pages/user/self-help/Career.jsx";
// import Disrupters from "../pages/user/self-help/Disrupters.jsx";
import AirtimeBenefitSimulator from "../pages/user/self-help/AirtimeBenefitSimulator.jsx";
import HandsetBenefitSimulator from "../pages/user/self-help/HandsetBenefitSimulator.jsx";
import Support from "../pages/user/support/Support.jsx";
import LostForm from "../pages/user/lostform/LostForm.jsx";
import TempStaffInfo from "../pages/user/info/TempStaffInfo.jsx";

// Finance Pages
import PendingApprovals from "../pages/finance/approvals/PendingApprovals.jsx";
import PaymentApproval from "../pages/finance/payment-approval/PaymentApproval.jsx";
import AssetCodeAssignment from "../pages/finance/payments/AssetCodeEntry.jsx";
import FinanceDashboard from "../pages/finance/dashboard/Dashboard.jsx";
import FinanceProfile from "../pages/finance/profile/Profile.jsx";
// Warehouse Pages
import WarehouseDashboard from "../pages/warehouse/dashboard/Dashboard.jsx";
import WarehouseReservation from "../pages/warehouse/reservation/Reservation.jsx";
import WarehouseMyReservations from "../pages/warehouse/my-reservations/MyReservations.jsx";
import WarehouseControlCards from "../pages/warehouse/control-cards/ControlCards.jsx";
import WarehouseProfile from "../pages/warehouse/profile/Profile.jsx";
// Retail Pages
import RetailDashboard from "../pages/retail/dashboard/Dashboard.jsx";
import Reservation from "../pages/retail/reservation/Reservation.jsx";
import MyReservations from "../pages/retail/my-reservations/MyReservations.jsx";
import ControlCards from "../pages/retail/control-cards/ControlCards.jsx";
import RetailProfile from "../pages/retail/profile/Profile.jsx";

const routes = [
  
  { path: "/Settings", element: <Settings />, roles: [1, 2, 3, 4, 5, 6, 7, 8] },
  {
    path: "/Notifications",
    element: <NotificationPage />,
    roles: [1, 2, 3, 4, 5, 6, 7, 8,9,10,11],
  },
  {
    path: "/admin/Dashboard",
    element: <AdminDashboard />,
    roles: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    path: "/admin/Calendar",
    element: <AdminCalendar />,
    roles: [1],
  },

  {
    path: "/admin/Employees",
    element: <Employees />,
    roles: [1, 2, 4, 5, 6, 7],
  },
  {
    path: "/admin/Handsets",
    element: <AdminHandsets />,
    roles: [1, 2, 4, 5, 6, 7],
  },
  {
    path: "/admin/Packages",
    element: <AdminPackages />,
    roles: [1, 2, 4, 5, 6, 7],
  },
  { path: "/admin/Upload", element: <AdminUploadPage />, roles: [1] },
  { path: "/admin/Contracts", element: <AdminContracts />, roles: [1, 5, 6] },
  {
    path: "/admin/Profile",
    element: <AdminProfileCard />,
    roles: [1, 2, 4, 5, 6, 7],
  },
  {
    path: "/admin/Reports",
    element: <AdminReports />,
    roles: [1, 2, 4, 5, 6, 7],
  },
  {
    path: "/staffDetails/:employeeCode",
    element: <StaffDetails />,
    roles: [1],
  },
  {
    path: "/staffDetails/:employeeCode/personal",
    element: <Personal />,
    roles: [1],
  },
  {
    path: "/staffDetails/:employeeCode/handsetBenefits",
    element: <HandsetBenefits />,
    roles: [1],
  },
  {
    path: "/staffDetails/:employeeCode/airtimeBenefits",
    element: <AirtimeBenefits />,
    roles: [1],
  },
  { path: "/user/Dashboard", element: <UserDashboard />, roles: [1, 3, 8, 9, 10, 11] },
  { path: "/user/Profile", element: <UserProfileCard />, roles: [1, 3, 8, 9, 10, 11] },
  { path: "/user/Airtime", element: <UserAirtime />, roles: [1, 3, 9, 10, 11] },
  { path: "/user/Handsets", element: <UserHandsets />, roles: [1, 3, 9, 10, 11] },
  { path: "/user/Calendar", element: <UserCalendar />, roles: [1, 3, 9, 10, 11] },
  { path: "/user/Support", element: <Support />, roles: [1, 3, 8, 9, 10, 11] },
  { path: "/user/LostForm", element: <LostForm />, roles: [1, 3, 8, 9, 10, 11] },
  { path: "/user/Info", element: <TempStaffInfo />, roles: [8] },
  { path: "/user/Benefits", element: <UserBenefits />, roles: [1, 3, 9, 10, 11] },
  { path: "/user/SelfHelp", element: <SelfHelp />, roles: [1, 3, 9, 10, 11] },
  // {
  //   path: "/user/SelfHelp/Compensation",
  //   element: <Compensation />,
  //   roles: [3],
  // },
  // { path: "/user/SelfHelp/Disrupters", element: <Disrupters />, roles: [3] },
  // {
  //   path: "/user/SelfHelp/WorkEnvironment",
  //   element: <WorkEnvironment />,
  //   roles: [3],},
  // { path: "/user/SelfHelp/Videos", element: <Videos />, roles: [3] },
  // { path: "/user/SelfHelp/FAQS", element: <FAQs />, roles: [3] },
  // { path: "/user/SelfHelp/Wellness", element: <Wellness />, roles: [3] },
  // { path: "/user/SelfHelp/Career", element: <Career />, roles: [3] },
  { path: "/user/SelfHelp/AirtimeBenefitSimulator", element: <AirtimeBenefitSimulator />, roles: [3] },
  { path: "/user/SelfHelp/HandsetBenefitSimulator", element: <HandsetBenefitSimulator />, roles: [3] },
  // Finance
  { path: "/finance/approvals", element: <PendingApprovals />, roles: [3, 9] },
  { path: "/finance/payment-approval", element: <PaymentApproval />, roles: [3, 9] },
  { path: "/finance/asset-code", element: <AssetCodeAssignment />, roles: [3, 9] },
  { path: "/finance/dashboard", element: <FinanceDashboard />, roles: [3, 9] },
  { path: "/finance/profile", element: <FinanceProfile />, roles: [3, 9] },
  // Warehouse
  { path: "/warehouse/dashboard", element: <WarehouseDashboard />, roles: [3, 10] },
  { path: "/warehouse/reservation", element: <WarehouseReservation />, roles: [3, 10] },
  { path: "/warehouse/my-reservations", element: <WarehouseMyReservations />, roles: [3, 10] },
  { path: "/warehouse/control-cards", element: <WarehouseControlCards />, roles: [3, 10] },
  { path: "/warehouse/profile", element: <WarehouseProfile />, roles: [3, 10] },
  // Retail
  { path: "/retail/dashboard", element: <RetailDashboard />, roles: [3, 11] },
  { path: "/retail/reservation", element: <Reservation />, roles: [3, 11] },
  { path: "/retail/my-reservations", element: <MyReservations />, roles: [3, 11] },
  { path: "/retail/control-cards", element: <ControlCards />, roles: [3, 11] },
  { path: "/retail/profile", element: <RetailProfile />, roles: [3, 11] },
];

const PrivateRoutes = () => {
  return routes.map((route, index) => (
    <Route
      key={index}
      path={route.path}
      element={
        <ProtectedRoute roles={route.roles}>{route.element}</ProtectedRoute>
      }
    />
  ));
};

export default PrivateRoutes;
