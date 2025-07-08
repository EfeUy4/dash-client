import { Link } from "react-router-dom";
import { Bell, Search, Target, MessageSquare } from "lucide-react";

const SalesRepHeader = () => {
	return (
		<div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-neutral-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
			<div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
				<div className="relative flex flex-1 items-center">
					<Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-neutral-400 ml-3" />
					<input
						className="block h-full w-full border-0 py-0 pl-10 pr-0 text-neutral-900 placeholder:text-neutral-400 focus:ring-0 sm:text-sm bg-transparent"
						placeholder="Search customers, orders..."
						type="search"
					/>
				</div>
				<div className="flex items-center gap-x-4 lg:gap-x-6">
					{/* Sales Target */}
					<button className="relative p-2 text-neutral-400 hover:text-neutral-500">
						<Target className="h-5 w-5" />
						<span className="absolute -top-1 -right-1 px-1 py-0.5 text-xs bg-green-500 text-white rounded-full">
							85%
						</span>
					</button>

					{/* Messages */}
					<Link to="/salesrep/reports" className="relative p-2 text-neutral-400 hover:text-neutral-500">
						<MessageSquare className="h-5 w-5" />
						<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500"></span>
					</Link>

					{/* Notifications */}
					<Link to="/salesrep/orders" className="relative p-2 text-neutral-400 hover:text-neutral-500">
						<Bell className="h-5 w-5" />
						<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500"></span>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default SalesRepHeader;
