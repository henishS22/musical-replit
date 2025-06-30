import React from "react";
import { Navigate, useRoutes } from "react-router-dom";

import DashboardLayout from "Layouts/Admin/DashboardLayout";
import Administrator from "Modules/Admin/Administrator";
import AdminDetails from "Modules/Admin/Administrator/Components/AdminDetails/AdminDetails";
import ViewRole from "Modules/Admin/Administrator/Components/ViewRole/ViewRole";
import Dashboard from "Modules/Admin/Dashboard";
import Login from "Modules/Auth/Login";
import OTP from "Modules/Auth/Login/OTP";
import GoogleAuth from "Modules/Auth/Login/GoogleAuth";
import VerifySecurityCode from "Modules/Auth/Login/VerifySecurityCode";
// import Category from "Modules/Admin/Category";
// import Collectible from "Modules/Admin/Collectible";
import UnderDevelopment from "Modules/Admin/UnderDevelopment";
// import ViewCollectible from "Modules/Admin/Collectible/Components/ViewMarketplace/ViewMarketplace";
import ResetPassword from "Modules/Auth/ResetPassword";
// import Analytics from "Modules/Admin/Analytics";
// import Cms from "Modules/Admin/Cms";
import Profile from "Modules/Admin/Profile";
// import Transaction from "Modules/Admin/Transaction";
import User from "Modules/Admin/User";
import ViewUser from "Modules/Admin/User/ViewUser/ViewUser";
import Subscription from "Modules/Admin/Subscription";
import ViewDistroRequest from "Modules/Admin/Distro/ViewUser/ViewDistroRqeuest";
import Distro from "Modules/Admin/Distro";
import Gamification from "Modules/Admin/Gamification";
import UserActivity from "Modules/Admin/UserActivity";
import Quest from "Modules/Admin/Quest";
import ViewRelease from "Modules/Admin/Release/ViewRelease/ViewRelease";
import Release from "Modules/Admin/Release";
// import Platform from "Modules/Admin/Platform";
// import ContractManagement from "Modules/Admin/ContractManagement";
// import ImportCollection from "Modules/Admin/ImportCollection";
// import ViewCollectionRequest from "Modules/Admin/ImportCollection/Components/ViewCollectionRequest/ViewCollection";
// ----------------------------------------------------------------------

export default function Router() {
  const token = localStorage.getItem("auth-token");
  const isAdmin = !!token;
  const isSuperAdmin = false;
  return useRoutes([
    {
      path: "/admin",
      element:
        isAdmin || isSuperAdmin ? (
          <DashboardLayout />
        ) : (
          <Navigate to="/login" replace />
        ),
      children: [
        { path: "", element: <Navigate to="/admin/dashboard" replace /> },
        { path: "dashboard", element: <Dashboard /> },
        { path: "administrator", element: <Administrator /> },
        { path: "administrator/details", element: <AdminDetails /> },
        { path: "administrator/view-role", element: <ViewRole /> },
        // { path: "category", element: <Category /> },
        // { path: "transaction", element: <Transaction /> },
        // { path: "collectible", element: <Collectible /> },
        // { path: "collectible/viewCollectible", element: <ViewCollectible /> },
        // { path: "analytics-and-reports", element: <Analytics /> },
        { path: "user", element: <User /> },
        { path: "user/view-user", element: <ViewUser /> },
        // { path: "platform", element: <Platform /> },
        // { path: "cms", element: <Cms /> },
        // { path: "contract-management", element: <ContractManagement /> },
        // { path: "import-collection", element: <ImportCollection /> },
        // { path: "import-collection/view", element: <ViewCollectionRequest /> },
        { path: "distro", element: <Distro /> },
        { path: "distro/view-request", element: <ViewDistroRequest /> },
        { path: "subscription", element: <Subscription /> },
        { path: "gamification", element: <Gamification /> },
        { path: "leaderboard", element: <UserActivity /> },
        { path: "quest", element: <Quest /> },

        { path: "release", element: <Release /> },
        { path: "release/view-release", element: <ViewRelease /> },
        {
          path: "profile",
          element: <Profile />,
        },
        { path: "*", element: <UnderDevelopment /> },
      ],
    },
    {
      path: "/login",
      element:
        !isAdmin && !isSuperAdmin ? (
          <Login />
        ) : (
          <Navigate to="/admin" replace />
        ),
    },
    {
      path: "/otp",
      element:
        !isAdmin && !isSuperAdmin ? <OTP /> : <Navigate to="/admin" replace />,
    },
    {
      path: "/google-auth",
      element:
        !isAdmin && !isSuperAdmin ? (
          <GoogleAuth />
        ) : (
          <Navigate to="/admin" replace />
        ),
    },
    {
      path: "/verify-security-code",
      element:
        !isAdmin && !isSuperAdmin ? (
          <VerifySecurityCode />
        ) : (
          <Navigate to="/admin" replace />
        ),
    },
    {
      path: "/reset-password",
      element:
        !isAdmin && !isSuperAdmin ? (
          <ResetPassword />
        ) : (
          <Navigate to="/admin" replace />
        ),
    },
    { path: "/", element: <Navigate to="/admin/dashboard" replace /> },
  ]);
}
