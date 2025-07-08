import { Outlet } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import CustomerHeader from "./CustomerHeader";

const CustomerLayout = () => {
	return (
		<div className="min-h-screen bg-neutral-50">
			<CustomerSidebar />
			<div className="lg:pl-72">
				<CustomerHeader />
				<main className="py-8">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default CustomerLayout;
