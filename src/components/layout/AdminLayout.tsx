import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
	return (
		<div className="min-h-screen bg-neutral-50">
			<AdminSidebar />
			<div className="lg:pl-72">
				<AdminHeader />
				<main className="py-8">
					<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminLayout;
