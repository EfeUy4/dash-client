import { useState, useEffect, useMemo } from "react";
import {
	Shield,
	Search,
	MapPin,
	CheckCircle,
	XCircle,
	Download,
	RefreshCw,
	User,
	AlertTriangle,
	Eye,
} from "lucide-react";
import api from "@/utils/api";
import { useToastUtils } from "@/services/toast";

interface LoginHistory {
	_id: string;
	userId: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		role: string;
	};
	timestamp: string;
	ipAddress: string;
	userAgent: string;
	success: boolean;
	method?: string;
	location?: {
		city: string;
		region: string;
		country: string;
	};
}

interface LocationData {
	city: string;
	region: string;
	country: string;
	flag: string;
}

const AdminSecurity = () => {
	const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
	const [dateRange, setDateRange] = useState<string>("week");
	const [selectedEntry, setSelectedEntry] = useState<LoginHistory | null>(null);
	const [locationCache, setLocationCache] = useState<{ [ip: string]: LocationData }>({});

	const { showErrorToast, showSuccessToast } = useToastUtils();

	// Fetch login history
	const fetchLoginHistory = async () => {
		try {
			setIsLoading(true);
			setError(null);
			const response = await api.get("/users/login-history", {
				params: {
					limit: 500,
					dateRange,
				},
			});
			setLoginHistory(response.data.loginHistory || []);
		} catch (err: any) {
			console.error("Error fetching login history:", err);
			setError(err.response?.data?.message || "Failed to fetch login history");
			showErrorToast(err.response?.data?.message || "Failed to fetch login history");
		} finally {
			setIsLoading(false);
		}
	};

	// Fetch location data for IP
	const fetchLocationForIP = async (ip: string) => {
		if (locationCache[ip] || ip === "127.0.0.1" || ip === "::1") return;

		try {
			const response = await fetch(`https://ipapi.co/${ip}/json/`);
			if (response.ok) {
				const data = await response.json();
				const locationData: LocationData = {
					city: data.city || "Unknown",
					region: data.region || "Unknown",
					country: data.country_name || "Unknown",
					flag: data.country_code ? `https://flagcdn.com/16x12/${data.country_code.toLowerCase()}.png` : "",
				};
				setLocationCache(prev => ({ ...prev, [ip]: locationData }));
			}
		} catch (error) {
			console.error("Error fetching location for IP:", ip, error);
		}
	};

	useEffect(() => {
		fetchLoginHistory();
	}, [dateRange]);

	// Fetch locations for visible IPs
	useEffect(() => {
		const uniqueIPs = [...new Set(loginHistory.map(entry => entry.ipAddress))];
		uniqueIPs.forEach(ip => {
			if (ip && !locationCache[ip]) {
				fetchLocationForIP(ip);
			}
		});
	}, [loginHistory, locationCache]);

	// Filter login history
	const filteredHistory = useMemo(() => {
		return loginHistory.filter(entry => {
			const matchesSearch = 
				entry.userId.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
				entry.userId.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				entry.userId.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				entry.ipAddress.includes(searchTerm);

			const matchesStatus = 
				statusFilter === "all" ||
				(statusFilter === "success" && entry.success) ||
				(statusFilter === "failed" && !entry.success);

			return matchesSearch && matchesStatus;
		});
	}, [loginHistory, searchTerm, statusFilter]);

	// Statistics
	const stats = useMemo(() => {
		const total = loginHistory.length;
		const successful = loginHistory.filter(entry => entry.success).length;
		const failed = loginHistory.filter(entry => !entry.success).length;
		const uniqueUsers = new Set(loginHistory.map(entry => entry.userId._id)).size;
		const uniqueIPs = new Set(loginHistory.map(entry => entry.ipAddress)).size;

		return {
			total,
			successful,
			failed,
			uniqueUsers,
			uniqueIPs,
			successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : "0",
		};
	}, [loginHistory]);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getTimeAgo = (dateString: string) => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) return `${diffInHours}h ago`;
		const diffInDays = Math.floor(diffInHours / 24);
		return `${diffInDays}d ago`;
	};

	const getBrowserInfo = (userAgent: string) => {
		if (userAgent.includes("Chrome")) return { name: "Chrome", icon: "🌐" };
		if (userAgent.includes("Firefox")) return { name: "Firefox", icon: "🦊" };
		if (userAgent.includes("Safari")) return { name: "Safari", icon: "🧭" };
		if (userAgent.includes("Edge")) return { name: "Edge", icon: "🌊" };
		return { name: "Unknown", icon: "❓" };
	};

	const getDeviceInfo = (userAgent: string) => {
		if (userAgent.includes("Mobile")) return { type: "Mobile", icon: "📱" };
		if (userAgent.includes("Tablet")) return { type: "Tablet", icon: "📱" };
		return { type: "Desktop", icon: "💻" };
	};

	const exportData = () => {
		const csvContent = [
			["Timestamp", "User", "Email", "IP Address", "Status", "Method", "User Agent"],
			...filteredHistory.map(entry => [
				formatDate(entry.timestamp),
				`${entry.userId.firstName} ${entry.userId.lastName}`,
				entry.userId.email,
				entry.ipAddress,
				entry.success ? "Success" : "Failed",
				entry.method || "password",
				entry.userAgent,
			]),
		]
			.map(row => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `login-history-${Date.now()}.csv`;
		document.body.appendChild(link);
		link.click();
		link.remove();
		window.URL.revokeObjectURL(url);

		showSuccessToast("Login history exported successfully");
	};

	// Error state
	if (error) {
		return (
			<div className="space-y-6 p-4 sm:p-6">
				<div className="flex justify-between items-center">
					<div>
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
							<Shield className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-2" />
							Security Center
						</h1>
						<p className="text-gray-600 text-sm sm:text-base">Monitor login activity and security events</p>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-sm border border-red-200 p-8">
					<div className="text-center">
						<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
						<h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Security Data</h3>
						<p className="text-red-600 mb-4">{error}</p>
						<button
							onClick={fetchLoginHistory}
							className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
						>
							<RefreshCw className="w-4 h-4" />
							Try Again
						</button>
					</div>
				</div>
			</div>
		);
	}

	// Loading state
	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64 p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading security data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
			{/* Header */}
			<div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
						<Shield className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 mr-2" />
						Security Center
					</h1>
					<p className="text-gray-600 text-sm sm:text-base">Monitor login activity and security events</p>
				</div>
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
					<button
						onClick={fetchLoginHistory}
						disabled={isLoading}
						className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
					>
						<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
						<span>Refresh</span>
					</button>
					<button
						onClick={exportData}
						className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
					>
						<Download className="w-5 h-5" />
						<span>Export</span>
					</button>
				</div>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
				<div className="bg-gradient-to-br from-purple-50/50 to-purple-100/70 p-4 rounded-xl border border-purple-100 shadow-sm">
					<div className="flex items-center">
						<div className="p-2 bg-purple-400 rounded-lg shadow-sm">
							<Shield className="w-5 h-5 text-white" />
						</div>
						<div className="ml-3">
							<h3 className="text-lg font-bold text-gray-900">{stats.total}</h3>
							<p className="text-xs text-purple-700">Total Logins</p>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-green-50/50 to-green-100/70 p-4 rounded-xl border border-green-100 shadow-sm">
					<div className="flex items-center">
						<div className="p-2 bg-green-400 rounded-lg shadow-sm">
							<CheckCircle className="w-5 h-5 text-white" />
						</div>
						<div className="ml-3">
							<h3 className="text-lg font-bold text-gray-900">{stats.successful}</h3>
							<p className="text-xs text-green-700">Successful</p>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-red-50/50 to-red-100/70 p-4 rounded-xl border border-red-100 shadow-sm">
					<div className="flex items-center">
						<div className="p-2 bg-red-400 rounded-lg shadow-sm">
							<XCircle className="w-5 h-5 text-white" />
						</div>
						<div className="ml-3">
							<h3 className="text-lg font-bold text-gray-900">{stats.failed}</h3>
							<p className="text-xs text-red-700">Failed</p>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-blue-50/50 to-blue-100/70 p-4 rounded-xl border border-blue-100 shadow-sm">
					<div className="flex items-center">
						<div className="p-2 bg-blue-400 rounded-lg shadow-sm">
							<User className="w-5 h-5 text-white" />
						</div>
						<div className="ml-3">
							<h3 className="text-lg font-bold text-gray-900">{stats.uniqueUsers}</h3>
							<p className="text-xs text-blue-700">Unique Users</p>
						</div>
					</div>
				</div>

				<div className="bg-gradient-to-br from-orange-50/50 to-orange-100/70 p-4 rounded-xl border border-orange-100 shadow-sm">
					<div className="flex items-center">
						<div className="p-2 bg-orange-400 rounded-lg shadow-sm">
							<MapPin className="w-5 h-5 text-white" />
						</div>
						<div className="ml-3">
							<h3 className="text-lg font-bold text-gray-900">{stats.uniqueIPs}</h3>
							<p className="text-xs text-orange-700">Unique IPs</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Search by user, email, or IP address..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
							/>
						</div>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value as "all" | "success" | "failed")}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="success">Successful</option>
						<option value="failed">Failed</option>
					</select>
					<select
						value={dateRange}
						onChange={(e) => setDateRange(e.target.value)}
						className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="day">Last 24 Hours</option>
						<option value="week">Last 7 Days</option>
						<option value="month">Last 30 Days</option>
						<option value="quarter">Last 3 Months</option>
					</select>
				</div>
			</div>

			{/* Login History Table */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<div className="p-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						Login History ({filteredHistory.length} entries)
					</h3>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									User
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Timestamp
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									IP Address
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Location
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Device
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredHistory.map((entry) => {
								const browser = getBrowserInfo(entry.userAgent);
								const device = getDeviceInfo(entry.userAgent);
								const location = locationCache[entry.ipAddress];

								return (
									<tr key={entry._id} className="hover:bg-gray-50">
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="flex items-center">
												<div className="flex-shrink-0 h-8 w-8">
													<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
														<span className="text-sm font-medium text-purple-600">
															{entry.userId.firstName.charAt(0)}
														</span>
													</div>
												</div>
												<div className="ml-3">
													<div className="text-sm font-medium text-gray-900">
														{entry.userId.firstName} {entry.userId.lastName}
													</div>
													<div className="text-sm text-gray-500">{entry.userId.email}</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="text-sm text-gray-900">{formatDate(entry.timestamp)}</div>
											<div className="text-sm text-gray-500">{getTimeAgo(entry.timestamp)}</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="text-sm font-mono text-gray-900">{entry.ipAddress}</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											{location ? (
												<div className="flex items-center text-sm text-gray-900">
													{location.flag && (
														<img src={location.flag} alt="" className="w-4 h-3 mr-2" />
													)}
													<div>
														<div>{location.city}</div>
														<div className="text-xs text-gray-500">{location.country}</div>
													</div>
												</div>
											) : (
												<div className="text-sm text-gray-500">Loading...</div>
											)}
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<div className="flex items-center text-sm text-gray-900">
												<span className="mr-2">{device.icon}</span>
												<div>
													<div>{device.type}</div>
													<div className="text-xs text-gray-500 flex items-center">
														<span className="mr-1">{browser.icon}</span>
														{browser.name}
													</div>
												</div>
											</div>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													entry.success
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{entry.success ? "Success" : "Failed"}
											</span>
										</td>
										<td className="px-4 py-4 whitespace-nowrap">
											<button
												onClick={() => setSelectedEntry(entry)}
												className="text-purple-600 hover:text-purple-700 text-sm font-medium"
											>
												<Eye className="w-4 h-4" />
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
					
					{filteredHistory.length === 0 && (
						<div className="text-center py-12">
							<Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
							<h3 className="text-sm font-medium text-gray-900 mb-1">No login history found</h3>
							<p className="text-sm text-gray-600">
								{searchTerm || statusFilter !== "all" 
									? "Try adjusting your search or filters"
									: "Login activity will appear here"}
							</p>
						</div>
					)}
				</div>
			</div>

			{/* Detail Modal */}
			{selectedEntry && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-96 overflow-y-auto">
						<div className="p-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold text-gray-900">Login Details</h3>
								<button
									onClick={() => setSelectedEntry(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									×
								</button>
							</div>
							<div className="space-y-3">
								<div>
									<label className="text-sm font-medium text-gray-500">User</label>
									<p className="text-sm text-gray-900">
										{selectedEntry.userId.firstName} {selectedEntry.userId.lastName} ({selectedEntry.userId.email})
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Timestamp</label>
									<p className="text-sm text-gray-900">{formatDate(selectedEntry.timestamp)}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">IP Address</label>
									<p className="text-sm font-mono text-gray-900">{selectedEntry.ipAddress}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Status</label>
									<p className={`text-sm ${selectedEntry.success ? "text-green-600" : "text-red-600"}`}>
										{selectedEntry.success ? "Successful" : "Failed"}
									</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">Method</label>
									<p className="text-sm text-gray-900">{selectedEntry.method || "password"}</p>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-500">User Agent</label>
									<p className="text-sm text-gray-900 break-all">{selectedEntry.userAgent}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminSecurity;