import { useState, useEffect } from "react";
import { Save, Bell, Package, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useToastUtils } from "../../services/toast";
import api from "../../utils/api";

interface ExchangeRateSettings {
	usdToNgnRate: number;
	lastUpdated: string;
	updatedBy?: string;
}

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

	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [exchangeSettings, setExchangeSettings] = useState<ExchangeRateSettings>({
		usdToNgnRate: 1650,
		lastUpdated: new Date().toISOString(),
		updatedBy: ''
	});
	
	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Fetch current exchange rate settings
	useEffect(() => {
		fetchExchangeSettings();
	}, []);

	const fetchExchangeSettings = async () => {
		try {
			setIsLoadingData(true);
			const response = await api.get('/settings/exchange-rate');
			if (response.data.settings) {
				setExchangeSettings(response.data.settings);
			}
		} catch (error: any) {
			console.error('Failed to fetch exchange rate settings:', error);
			// Use default values if fetch fails
		} finally {
			setIsLoadingData(false);
		}
	};

	const handleRateChange = (value: string) => {
		const rate = parseFloat(value);
		if (!isNaN(rate) && rate > 0) {
			setExchangeSettings(prev => ({
				...prev,
				usdToNgnRate: rate
			}));
		}
	};

	const handleSaveExchangeRate = async () => {
		try {
			setIsLoading(true);
			
			if (exchangeSettings.usdToNgnRate <= 0) {
				showErrorToast('Exchange rate must be greater than 0');
				return;
			}

			await api.post('/settings/exchange-rate', {
				usdToNgnRate: exchangeSettings.usdToNgnRate
			});
			
			showSuccessToast('Exchange rate updated successfully');
			// Refresh settings to get updated timestamp and user info
			await fetchExchangeSettings();
		} catch (error: any) {
			console.error('Failed to update exchange rate:', error);
			showErrorToast(error.response?.data?.message || 'Failed to update exchange rate');
		} finally {
			setIsLoading(false);
		}
	};

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

	const formatCurrency = (amount: number, rate: number) => {
		return `₦${(amount * rate).toLocaleString()}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleString();
	};

	if (isLoadingData) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-600"></div>
			</div>
		);
	}

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

			{/* Exchange Rate Settings */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Exchange Rate Management */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
				>
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center">
							<DollarSign className="w-5 h-5 text-green-600 mr-2" />
							<h2 className="text-xl font-serif font-semibold text-neutral-900">Exchange Rate</h2>
						</div>
						<Button onClick={handleSaveExchangeRate} isLoading={isLoading}>
							<Save className="w-4 h-4 mr-2" />
							Save Rate
						</Button>
					</div>

					<div className="space-y-6">
						<Input
							label="USD to NGN Rate"
							type="number"
							step="0.01"
							min="1"
							value={exchangeSettings.usdToNgnRate}
							onChange={(e) => handleRateChange(e.target.value)}
							placeholder="Enter exchange rate"
							helperText={`$1 USD = ₦${exchangeSettings.usdToNgnRate.toLocaleString()}`}
						/>

						{exchangeSettings.lastUpdated && (
							<div className="bg-gray-50 rounded-lg p-4">
								<p className="text-sm text-gray-600">
									<strong>Last Updated:</strong> {formatDate(exchangeSettings.lastUpdated)}
								</p>
								{exchangeSettings.updatedBy && (
									<p className="text-sm text-gray-600 mt-1">
										<strong>Updated By:</strong> {exchangeSettings.updatedBy}
									</p>
								)}
							</div>
						)}
					</div>
				</motion.div>

				{/* Rate Preview */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
				>
					<div className="flex items-center mb-6">
						<TrendingUp className="w-5 h-5 text-blue-600 mr-2" />
						<h2 className="text-xl font-serif font-semibold text-neutral-900">Rate Preview</h2>
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center p-4 bg-green-50 rounded-lg">
								<p className="text-sm text-green-700 font-medium">$10 USD</p>
								<p className="text-lg font-bold text-green-900">
									{formatCurrency(10, exchangeSettings.usdToNgnRate)}
								</p>
							</div>
							<div className="text-center p-4 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-700 font-medium">$50 USD</p>
								<p className="text-lg font-bold text-blue-900">
									{formatCurrency(50, exchangeSettings.usdToNgnRate)}
								</p>
							</div>
						</div>
						
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center p-4 bg-purple-50 rounded-lg">
								<p className="text-sm text-purple-700 font-medium">$100 USD</p>
								<p className="text-lg font-bold text-purple-900">
									{formatCurrency(100, exchangeSettings.usdToNgnRate)}
								</p>
							</div>
							<div className="text-center p-4 bg-orange-50 rounded-lg">
								<p className="text-sm text-orange-700 font-medium">$500 USD</p>
								<p className="text-lg font-bold text-orange-900">
									{formatCurrency(500, exchangeSettings.usdToNgnRate)}
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<div className="flex items-start">
							<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
							<div>
								<p className="text-sm text-yellow-800 font-medium">Important Note</p>
								<p className="text-sm text-yellow-700 mt-1">
									This rate affects how product prices are displayed to customers. 
									Products are stored in USD and converted to NGN using this rate.
								</p>
							</div>
						</div>
					</div>
				</motion.div>
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
