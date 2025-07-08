import { useState } from "react";
import { Save, Bell, Package } from "lucide-react";

const StoreKeeperSettings = () => {
	const [settings, setSettings] = useState({
		notifications: {
			lowStockAlerts: true,
			outOfStockAlerts: true,
			expiryAlerts: true,
			emailNotifications: false,
			smsNotifications: true,
		},
		inventory: {
			defaultMinStock: 10,
			autoReorderPoint: 5,
			stockMovementLogging: true,
			requireApprovalForAdjustments: true,
		},
		display: {
			itemsPerPage: 25,
			showProductImages: true,
			defaultSortBy: "name",
			groupByCategory: false,
		},
	});

	const handleSave = () => {
		// Add API call here
		console.log("Settings saved:", settings);
	};

	const updateSetting = (section: string, key: string, value: any) => {
		setSettings((prev) => ({
			...prev,
			[section]: {
				...prev[section as keyof typeof prev],
				[key]: value,
			},
		}));
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">Settings</h1>
				<button
					onClick={handleSave}
					className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
				>
					<Save className="w-4 h-4" />
					<span>Save Changes</span>
				</button>
			</div>

			{/* Notification Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Bell className="w-5 h-5 text-orange-600" />
					<h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Low Stock Alerts</h3>
							<p className="text-sm text-gray-600">Get notified when items are running low</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.lowStockAlerts}
							onChange={(e) => updateSetting("notifications", "lowStockAlerts", e.target.checked)}
							className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Out of Stock Alerts</h3>
							<p className="text-sm text-gray-600">Get notified when items are out of stock</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.outOfStockAlerts}
							onChange={(e) => updateSetting("notifications", "outOfStockAlerts", e.target.checked)}
							className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
							<p className="text-sm text-gray-600">Receive notifications via email</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.emailNotifications}
							onChange={(e) => updateSetting("notifications", "emailNotifications", e.target.checked)}
							className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>

			{/* Inventory Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Package className="w-5 h-5 text-orange-600" />
					<h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Default Minimum Stock Level
						</label>
						<input
							type="number"
							value={settings.inventory.defaultMinStock}
							onChange={(e) => updateSetting("inventory", "defaultMinStock", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Auto Reorder Point</label>
						<input
							type="number"
							value={settings.inventory.autoReorderPoint}
							onChange={(e) => updateSetting("inventory", "autoReorderPoint", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
						/>
					</div>
				</div>

				<div className="mt-4 space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Stock Movement Logging</h3>
							<p className="text-sm text-gray-600">Log all inventory movements</p>
						</div>
						<input
							type="checkbox"
							checked={settings.inventory.stockMovementLogging}
							onChange={(e) => updateSetting("inventory", "stockMovementLogging", e.target.checked)}
							className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Require Approval for Adjustments</h3>
							<p className="text-sm text-gray-600">Require manager approval for stock adjustments</p>
						</div>
						<input
							type="checkbox"
							checked={settings.inventory.requireApprovalForAdjustments}
							onChange={(e) => updateSetting("inventory", "requireApprovalForAdjustments", e.target.checked)}
							className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>

			{/* Display Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h2>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Items Per Page</label>
						<select
							value={settings.display.itemsPerPage}
							onChange={(e) => updateSetting("display", "itemsPerPage", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
						>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
							<option value={100}>100</option>
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Default Sort By</label>
						<select
							value={settings.display.defaultSortBy}
							onChange={(e) => updateSetting("display", "defaultSortBy", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
						>
							<option value="name">Name</option>
							<option value="sku">SKU</option>
							<option value="stock">Stock Level</option>
							<option value="price">Price</option>
						</select>
					</div>
				</div>
			</div>
		</div>
	);
};

export default StoreKeeperSettings;
