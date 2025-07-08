import { Outlet } from "react-router-dom";
import StoreKeeperSidebar from "./StoreKeeperSidebar";
import StoreKeeperHeader from "./StoreKeeperHeader";

const StoreKeeperLayout = () => {
	return (
		<div className="min-h-screen bg-neutral-50">
			<StoreKeeperSidebar />
			<div className="lg:pl-72">
				<StoreKeeperHeader />
				<main className="py-8">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default StoreKeeperLayout;
