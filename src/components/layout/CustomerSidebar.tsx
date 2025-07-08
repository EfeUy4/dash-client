// components/layout/CustomerSidebar.tsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, User, MapPin, Clock, X, Menu, LogOut, Home, HomeIcon } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import Logo from "../Logo";

const CustomerSidebar = () => {
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const { user, logout } = useAuth();
	const location = useLocation();

	const navigation = [
		{ name: "Dashboard", href: "/customer", icon: HomeIcon },
		{ name: "Browse Products", href: "/shop", icon: ShoppingBag },
		{ name: "My Orders", href: "/customer/orders", icon: Clock },
		{ name: "Wishlist", href: "/wishlist", icon: Heart },
		{ name: "My Account", href: "/customer/account", icon: User },
		{ name: "Addresses", href: "/customer/addresses", icon: MapPin },
	];

	const isActivePath = (path: string) => {
		if (path === "/customer") {
			return location.pathname === "/customer";
		}
		return location.pathname.startsWith(path);
	};

	const SidebarContent = () => (
		<div className="flex h-full flex-col">
			{/* Logo */}
			<div className="flex h-16 max-lg:hidden shrink-0 items-center px-6 border-b border-neutral-200">
				<Logo />
			</div>

			{/* Navigation */}
			<nav className="flex flex-1 flex-col px-6 py-6">
				<ul className="space-y-1">
					{navigation.map((item) => {
						const isActive = isActivePath(item.href);
						return (
							<li key={item.name}>
								<Link
									to={item.href}
									onClick={() => setIsMobileOpen(false)}
									className={`group flex gap-x-3 rounded-md p-3 text-sm font-medium transition-colors ${
										isActive
											? "bg-blue-600 text-white"
											: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900"
									}`}
								>
									<item.icon
										className={`h-5 w-5 shrink-0 ${
											isActive ? "text-white" : "text-neutral-400 group-hover:text-neutral-900"
										}`}
									/>
									{item.name}
								</Link>
							</li>
						);
					})}
				</ul>

				{/* Quick Actions */}
				<div className="mt-8">
					<p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Quick Links</p>
					<div className="space-y-2">
						<Link
							to="/"
							className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							<Home className="w-4 h-4" />
							<span>Home</span>
						</Link>
						<Link
							to="/categories"
							className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							<ShoppingBag className="w-4 h-4" />
							<span>All Categories</span>
						</Link>
					</div>
				</div>

				{/* User Info */}
				<div className="mt-auto pt-6 border-t border-neutral-200">
					{user ? (
						<>
							<div className="flex items-center space-x-3 mb-3">
								<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
									<span className="text-blue-600 font-medium text-sm">
										{user?.firstName?.[0]}
										{user?.lastName?.[0]}
									</span>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-neutral-900 truncate">
										{user?.firstName} {user?.lastName}
									</p>
									<p className="text-xs text-neutral-500 truncate">{user?.email}</p>
								</div>
							</div>
							<button
								onClick={logout}
								className="flex items-center space-x-2 text-sm text-neutral-600 hover:text-red-600 transition-colors w-full"
							>
								<LogOut className="w-4 h-4" />
								<span>Sign Out</span>
							</button>
						</>
					) : (
						<div className="space-y-2">
							<Link
								to="/login"
								className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
							>
								Sign In
							</Link>
							<Link
								to="/register"
								className="flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
							>
								Create Account
							</Link>
						</div>
					)}
				</div>
			</nav>
		</div>
	);

	return (
		<>
			{/* Mobile menu button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<button
					onClick={() => setIsMobileOpen(true)}
					className="bg-white p-2 rounded-md shadow-sm border border-neutral-200"
				>
					<Menu className="w-5 h-5" />
				</button>
			</div>

			{/* Desktop sidebar */}
			<div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
				<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-neutral-200">
					<SidebarContent />
				</div>
			</div>

			{/* Mobile sidebar */}
			<AnimatePresence>
				{isMobileOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="lg:hidden fixed inset-0 z-50 bg-black/50"
							onClick={() => setIsMobileOpen(false)}
						/>

						{/* Sidebar */}
						<motion.div
							initial={{ x: -280 }}
							animate={{ x: 0 }}
							exit={{ x: -280 }}
							transition={{ type: "tween", duration: 0.3 }}
							className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white"
						>
							<div className="flex h-full flex-col">
								{/* Close button */}
								<div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
									<Logo />
									<button
										onClick={() => setIsMobileOpen(false)}
										className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
								<div className="flex-1 overflow-y-auto">
									<SidebarContent />
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default CustomerSidebar;
