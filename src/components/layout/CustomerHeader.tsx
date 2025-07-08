import { Search, ShoppingCart, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useAppSelector } from "@/redux/hooks";
import { selectWishlistIds } from "@/redux/selectors/wishlistSelectors";

const CustomerHeader = () => {
	const { user } = useAuth();
	const { itemCount } = useCart();
	const countWishList = useAppSelector(selectWishlistIds).length;

	return (
		<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
			<div className="flex flex-1 justify-between gap-x-4 self-stretch lg:gap-x-6">
				{/* Search */}
				<div className="relative flex flex-1 items-center max-w-lg">
					<Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-neutral-400 ml-3" />
					<input
						className="block h-full w-full border-0 outline-none py-0 pl-10 pr-0 text-neutral-900 placeholder:text-neutral-400 sm:text-sm bg-transparent"
						placeholder="Search products..."
						type="search"
					/>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-x-4 lg:gap-x-6">
					{/* Wishlist */}
					<Link
						to="/wishlist"
						className="relative p-2 text-neutral-400 hover:text-neutral-500 transition-colors"
					>
						<Heart className="h-5 w-5" />
						{countWishList > 0 && (
							<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
								{countWishList}
							</span>
						)}
					</Link>

					{/* Shopping Cart */}
					<Link to="/cart" className="relative p-2 text-neutral-400 hover:text-neutral-500 transition-colors">
						<ShoppingCart className="h-5 w-5" />
						{itemCount > 0 && (
							<span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary-600 text-xs text-white flex items-center justify-center">
								{itemCount}
							</span>
						)}
					</Link>

					{/* User Account */}
					{user ? (
						<Link
							to="/customer/account"
							className="flex items-center space-x-2 p-2 text-neutral-400 hover:text-neutral-500 transition-colors"
						>
							<div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
								<span className="text-primary-600 font-medium text-xs">
									{user?.firstName?.[0]}
									{user?.lastName?.[0]}
								</span>
							</div>
						</Link>
					) : (
						<div className="flex items-center space-x-2">
							<Link
								to="/login"
								className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
							>
								Sign In
							</Link>
							<span className="text-neutral-300">|</span>
							<Link
								to="/register"
								className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
							>
								Sign Up
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default CustomerHeader;
