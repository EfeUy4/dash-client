import { Outlet } from "react-router-dom";
import SalesRepSidebar from "./SalesRepSidebar";
import SalesRepHeader from "./SalesRepHeader";

const SalesRepLayout = () => {
	return (
		<div className="min-h-screen bg-neutral-50">
			<SalesRepSidebar />
			<div className="lg:pl-72">
				<SalesRepHeader />
				<main className="py-8">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default SalesRepLayout;
