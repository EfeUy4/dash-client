import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/Toaster";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CategoriesPage from "./pages/CategoriesPage";
import NewArrivalsPage from "./pages/NewArrivalsPage";
import SupportPage from "./pages/SupportPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import WishlistPage from "./pages/WishlistPage";

// Customer Layout & Pages
import CustomerLayout from "./components/layout/CustomerLayout";
import CustomerAccount from "./pages/customer/CustomerAccount";
import CustomerOrders from "./pages/customer/CustomerOrderHistory";
import CustomerAddresses from "./pages/customer/CustomerAddresses";

// StoreKeeper Layout & Pages
import StoreKeeperLayout from "./components/layout/StoreKeeperLayout";
import StoreKeeperDashboard from "./pages/storekeeper/StoreKeeperDashboard";
import StoreKeeperProducts from "./pages/storekeeper/StoreKeeperProducts";
import StoreKeeperReceiving from "./pages/storekeeper/StoreKeeperReceiving";
import StoreKeeperAlerts from "./pages/storekeeper/StoreKeeperAlerts";
import StoreKeeperReports from "./pages/storekeeper/StoreKeeperReports";
import StoreKeeperSettings from "./pages/storekeeper/StoreKeeperSettings";
import StoreKeeperOrderHistory from "./pages/storekeeper/StoreKeeperOrderHistory";

// SalesRep Layout & Pages
import SalesRepLayout from "./components/layout/SalesRepLayout";
import SalesRepDashboard from "./pages/salesrep/SalesRepDashboard";
import SalesRepOrders from "./pages/salesrep/SalesRepOrderHistory";
import SalesRepOrderPage from "./pages/salesrep/SalesRepOrderPage";
import SalesRepReports from "./pages/salesrep/SalesRepReports";
import SalesRepSettings from "./pages/salesrep/SalesRepSettings";

// Admin Layout & Pages
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminReports from "./pages/admin/AdminReports";
import AdminInventory from "./pages/admin/AdminInventory";
import { useSocket } from "./hooks/useSocket";
import { useInitialData } from "./hooks/useInitialData";
import AuthPageProtectedRoute from "./components/auth/AuthPageProtectedRoute";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminAlerts from "./pages/admin/AdminAlerts";

function App() {
	useSocket();
	useInitialData();

	return (
		<>
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<Layout />}>
					<Route index element={<HomePage />} />
					<Route path="about" element={<AboutPage />} />
					<Route path="products" element={<ProductsPage />} />
					<Route path="products/:id" element={<ProductDetailPage />} />
					<Route path="categories" element={<CategoriesPage />} />
					<Route path="categories/:category" element={<ProductsPage />} />
					<Route path="new-arrivals" element={<NewArrivalsPage />} />
					<Route path="wishlist" element={<WishlistPage />} />
					<Route path="support" element={<SupportPage />} />
					<Route path="cart" element={<CartPage />} />
					<Route path="checkout" element={<CheckoutPage />} />
					<Route path="store" element={<ProductsPage />} />
					<Route path="shop" element={<ProductsPage />} />
				</Route>

				{/* Auth Routes */}
				<Route
					path="/login"
					element={
						<AuthPageProtectedRoute>
							<LoginPage />
						</AuthPageProtectedRoute>
					}
				/>

				<Route
					path="/register"
					element={
						<AuthPageProtectedRoute>
							<RegisterPage />
						</AuthPageProtectedRoute>
					}
				/>

				{/* Customer Routes */}
				<Route
					path="/customer"
					element={
						<ProtectedRoute requiredRole="customer">
							<CustomerLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<CustomerDashboard />} />
					<Route path="orders" element={<CustomerOrders />} />
					<Route path="account" element={<CustomerAccount />} />
					<Route path="addresses" element={<CustomerAddresses />} />
				</Route>

				{/* StoreKeeper Routes */}
				<Route
					path="/storekeeper"
					element={
						<ProtectedRoute requiredRole="storekeeper">
							<StoreKeeperLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<StoreKeeperDashboard />} />
					<Route path="products" element={<StoreKeeperProducts />} />
					<Route path="order-history" element={<StoreKeeperOrderHistory />} />
					<Route path="receiving" element={<StoreKeeperReceiving />} />
					<Route path="alerts" element={<StoreKeeperAlerts />} />
					<Route path="reports" element={<StoreKeeperReports />} />
					<Route path="settings" element={<StoreKeeperSettings />} />
				</Route>

				{/* SalesRep Routes */}
				<Route
					path="/salesrep"
					element={
						<ProtectedRoute requiredRole="salesrep">
							<SalesRepLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<SalesRepDashboard />} />
					<Route path="orders" element={<SalesRepOrders />} />
					<Route path="create-order" element={<SalesRepOrderPage />} />
					<Route path="reports" element={<SalesRepReports />} />
					<Route path="settings" element={<SalesRepSettings />} />
				</Route>

				{/* Admin Routes */}
				<Route
					path="/admin"
					element={
						<ProtectedRoute requiredRole="admin">
							<AdminLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<AdminDashboard />} />
					<Route path="users" element={<AdminUsers />} />
					<Route path="inventory" element={<AdminInventory />} />
					<Route path="security" element={<AdminSecurity />} />
					<Route path="system" element={<AdminSystem />} />
					<Route path="reports" element={<AdminReports />} />
					<Route path="orders" element={<AdminOrders />} />
					<Route path="alerts" element={<AdminAlerts />} />
				</Route>

				{/*    --    --   --   --  */}
				{/* Catch-all for undefined routes */}
				{/*    --    --   --   --  */}

				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
			<Toaster />
		</>
	);
}

export default App;
