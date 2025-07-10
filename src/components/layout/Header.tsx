import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	Menu,
	X,
	Search,
	ShoppingBag,
	User,
	Heart,
	ChevronDown,
	LayoutDashboard,
	Package,
	Users,
	Shield,
	Settings,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useAppSelector } from "@/redux/hooks";
import { selectWishlistIds } from "@/redux/selectors/wishlistSelectors";
import Logo from "../Logo";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const { isAuthenticated, user, logout } = useAuth();
	const { itemCount } = useCart();
	const countWishList = useAppSelector(selectWishlistIds).length;
	const navigate = useNavigate();

	const navigation = [
		{ name: "Home", href: "/" },
		{ name: "Products", href: "/products" },
		{ name: "Categories", href: "/categories" },
		{ name: "New Arrivals", href: "/new-arrivals" },
		{ name: "About", href: "/about" },
		{ name: "Support", href: "/support" },
	];

	// Role-based dashboard routing
	const getDashboardRoute = () => {
		if (!user?.role) return "/shop";

		switch (user.role) {
			case "admin":
				return "/admin";
			case "salesrep":
				return "/salesrep";
			case "storekeeper":
				return "/storekeeper";
			case "customer":
				return "/customer";
			default:
				return "/shop";
		}
	};

	// Role-based menu items
	const getRoleBasedMenuItems = () => {
		if (!isAuthenticated || !user?.role) return [];

		const baseItems = [
			{
				label: "Dashboard",
				href: getDashboardRoute(),
				icon: LayoutDashboard,
			},
		];

		switch (user.role) {
			case "admin":
				return [
					...baseItems,
					{ label: "User Management", href: "/admin/users", icon: Users },
					{ label: "System Settings", href: "/admin/system", icon: Settings },
					{ label: "Security", href: "/admin/security", icon: Shield },
				];

			case "salesrep":
				return [
					...baseItems,
					{ label: "My Orders", href: "/salesrep/orders", icon: ShoppingBag },
					{ label: "Customers", href: "/salesrep/customers", icon: Users },
					{ label: "Sales Targets", href: "/salesrep/targets", icon: LayoutDashboard },
				];

			case "storekeeper":
				return [
					...baseItems,
					{ label: "Products", href: "/storekeeper/products", icon: Package },
					{ label: "Stock Management", href: "/storekeeper/stock", icon: Package },
					{ label: "Receiving", href: "/storekeeper/receiving", icon: Package },
				];

			case "customer":
			default:
				return [
					{ label: "Shop", href: "/shop", icon: ShoppingBag },
					{ label: "My Orders", href: "/customer/orders", icon: Package },
					{ label: "My Account", href: "/customer/account", icon: User },
				];
		}
	};

	// Conditional rendering of cart and wishlist for non-admin roles
	const showShoppingFeatures = () => {
		return !user?.role || user.role === "customer" || user.role === "salesrep";
	};

	const handleLogout = () => {
		logout();
		setIsUserMenuOpen(false);
		navigate("/");
	};

	const handleDashboardClick = () => {
		navigate(getDashboardRoute());
		setIsUserMenuOpen(false);
	};

	return (
		<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
			<div className="container">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Logo />

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-8">
						{navigation.map((item) => (
							<Link
								key={item.name}
								to={item.href}
								className="text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
							>
								{item.name}
							</Link>
						))}
					</nav>

					{/* Actions */}
					<div className="flex items-center space-x-4">
						{/* Search - Show for all users */}
						<button
							onClick={() => setIsSearchOpen(!isSearchOpen)}
							className="p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
						>
							<Search className="w-5 h-5" />
						</button>

						{/* Wishlist - Only for customers and sales reps */}
						{showShoppingFeatures() && (
							<Link
								to="/wishlist"
								className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
							>
								<Heart className="w-5 h-5" />

								{countWishList > 0 && (
									<span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{countWishList}
									</span>
								)}
							</Link>
						)}

						{/* Cart - Only for customers and sales reps */}
						{showShoppingFeatures() && (
							<Link
								to="/cart"
								className="relative p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
							>
								<ShoppingBag className="w-5 h-5" />
								{itemCount > 0 && (
									<span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
										{itemCount}
									</span>
								)}
							</Link>
						)}

						{/* Quick Dashboard Access for authenticated users */}
						{isAuthenticated && (
							<button
								onClick={handleDashboardClick}
								className="hidden sm:flex p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
								title="Go to Dashboard"
							>
								<LayoutDashboard className="w-5 h-5" />
							</button>
						)}

						{/* User Menu */}
						<div className="relative">
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className="flex items-center space-x-1 p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
							>
								<User className="w-5 h-5" />
								{isAuthenticated && <ChevronDown className="w-3 h-3" />}
							</button>

							<AnimatePresence>
								{isUserMenuOpen && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: 10 }}
										className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-neutral-200 py-1"
									>
										{isAuthenticated ? (
											<>
												{/* User Info */}
												<div className="px-4 py-3 border-b border-neutral-100">
													<p className="text-sm font-medium text-neutral-900">
														{user?.firstName} {user?.lastName}
													</p>
													<p className="text-xs text-neutral-500">{user?.email}</p>
													{user?.role && (
														<span
															className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
																user.role === "admin"
																	? "bg-purple-100 text-purple-800"
																	: user.role === "salesrep"
																	? "bg-green-100 text-green-800"
																	: user.role === "storekeeper"
																	? "bg-orange-100 text-orange-800"
																	: "bg-blue-100 text-blue-800"
															}`}
														>
															{user.role.charAt(0).toUpperCase() + user.role.slice(1)}
														</span>
													)}
												</div>

												{/* Role-based Menu Items */}
												{getRoleBasedMenuItems().map((item) => {
													const IconComponent = item.icon;
													return (
														<Link
															key={item.href}
															to={item.href}
															className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
															onClick={() => setIsUserMenuOpen(false)}
														>
															<IconComponent className="w-4 h-4" />
															<span>{item.label}</span>
														</Link>
													);
												})}

												{/* General Settings - Available to all authenticated users */}
												<div className="border-t border-neutral-100 mt-1 pt-1">
													{user?.role === "customer" && (
														<>
															<Link
																to="/customer/addresses"
																className="flex items-center space-x-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
																onClick={() => setIsUserMenuOpen(false)}
															>
																<Settings className="w-4 h-4" />
																<span>Addresses</span>
															</Link>
														</>
													)}

													<button
														onClick={handleLogout}
														className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 border-t border-neutral-100 mt-1 pt-2"
													>
														<X className="w-4 h-4" />
														<span>Sign Out</span>
													</button>
												</div>
											</>
										) : (
											<>
												<Link
													to="/login"
													className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
													onClick={() => setIsUserMenuOpen(false)}
												>
													Sign In
												</Link>
												<Link
													to="/register"
													className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
													onClick={() => setIsUserMenuOpen(false)}
												>
													Create Account
												</Link>
											</>
										)}
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Mobile Menu Toggle */}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="lg:hidden p-2 text-neutral-700 hover:text-neutral-900 transition-colors"
						>
							{isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
					</div>
				</div>

				{/* Search Bar */}
				<AnimatePresence>
					{isSearchOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="border-t border-neutral-200 py-4"
						>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
								<input
									type="text"
									placeholder="Search products..."
									className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
								/>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Mobile Navigation */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="lg:hidden border-t border-neutral-200 py-4 space-y-4"
						>
							{navigation.map((item) => (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => setIsMenuOpen(false)}
									className="block text-neutral-700 hover:text-neutral-900 transition-colors"
								>
									{item.name}
								</Link>
							))}

							{/* Mobile role-based menu items */}
							{isAuthenticated && (
								<div className="border-t border-neutral-200 pt-4 mt-4">
									<p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
										My Account
									</p>
									{getRoleBasedMenuItems().map((item) => {
										const IconComponent = item.icon;
										return (
											<Link
												key={item.href}
												to={item.href}
												onClick={() => setIsMenuOpen(false)}
												className="flex items-center space-x-2 py-2 text-neutral-700 hover:text-neutral-900 transition-colors"
											>
												<IconComponent className="w-4 h-4" />
												<span>{item.label}</span>
											</Link>
										);
									})}
								</div>
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</header>
	);
};

export default Header;
