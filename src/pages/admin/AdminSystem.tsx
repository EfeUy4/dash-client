// pages/admin/AdminSystem.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToastUtils } from "../../services/toast";
import api from "../../utils/api";

interface ExchangeRateSettings {
	usdToNgnRate: number;
	lastUpdated: string;
	updatedBy?: string;
}

const AdminSystem = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [isLoadingData, setIsLoadingData] = useState(true);
	const [settings, setSettings] = useState<ExchangeRateSettings>({
		usdToNgnRate: 1650,
		lastUpdated: new Date().toISOString(),
		updatedBy: "",
	});

	const { showSuccessToast, showErrorToast } = useToastUtils();

	// Fetch current exchange rate settings
	useEffect(() => {
		fetchSettings();
	}, []);

	const fetchSettings = async () => {
		try {
			setIsLoadingData(true);
			const response = await api.get("/settings/exchange-rate");
			if (response.data.settings) {
				setSettings(response.data.settings);
			}
		} catch (error: any) {
			console.error("Failed to fetch exchange rate settings:", error);
			// Use default values if fetch fails
		} finally {
			setIsLoadingData(false);
		}
	};

	const handleRateChange = (value: string) => {
		const rate = parseFloat(value);
		if (!isNaN(rate) && rate > 0) {
			setSettings((prev) => ({
				...prev,
				usdToNgnRate: rate,
			}));
		}
	};

	const handleSave = async () => {
		try {
			setIsLoading(true);

			if (settings.usdToNgnRate <= 0) {
				showErrorToast("Exchange rate must be greater than 0");
				return;
			}

			await api.post("/settings/exchange-rate", {
				usdToNgnRate: settings.usdToNgnRate,
			});

			showSuccessToast("Exchange rate updated successfully");
			// Refresh settings to get updated timestamp and user info
			await fetchSettings();
		} catch (error: any) {
			console.error("Failed to update exchange rate:", error);
			showErrorToast(error.response?.data?.message || "Failed to update exchange rate");
		} finally {
			setIsLoading(false);
		}
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
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between flex-wrap gap-5">
				<div>
					<h1 className="text-2xl font-serif font-bold text-neutral-900">Exchange Rate Settings</h1>
					<p className="text-neutral-600">Manage USD to NGN exchange rate for the store</p>
				</div>
				<Button onClick={handleSave} isLoading={isLoading}>
					<Save className="w-4 h-4 mr-2" />
					Save Rate
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Exchange Rate Settings */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6"
				>
					<div className="flex items-center mb-6">
						<DollarSign className="w-5 h-5 text-green-600 mr-2" />
						<h2 className="text-xl font-serif font-semibold text-neutral-900">Current Exchange Rate</h2>
					</div>

					<div className="space-y-6">
						<Input
							label="USD to NGN Rate"
							type="number"
							step="0.01"
							min="1"
							value={settings.usdToNgnRate}
							onChange={(e) => handleRateChange(e.target.value)}
							placeholder="Enter exchange rate"
							helperText={`$1 USD = ₦${settings.usdToNgnRate.toLocaleString()}`}
						/>

						{settings.lastUpdated && (
							<div className="bg-gray-50/50 rounded-lg p-4">
								<p className="text-sm text-gray-600">
									<strong>Last Updated:</strong> {formatDate(settings.lastUpdated)}
								</p>
								{settings.updatedBy && (
									<p className="text-sm text-gray-600 mt-1">
										<strong>Updated By:</strong> {settings.updatedBy}
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
							<div className="p-4 bg-green-50/50 rounded-lg">
								<p className="text-sm text-green-700 font-medium">$10 USD</p>
								<p className="text-lg font-bold text-green-900">
									{formatCurrency(10, settings.usdToNgnRate)}
								</p>
							</div>
							<div className="p-4 bg-blue-50/50 rounded-lg">
								<p className="text-sm text-blue-700 font-medium">$50 USD</p>
								<p className="text-lg font-bold text-blue-900">{formatCurrency(50, settings.usdToNgnRate)}</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 bg-purple-50/50 rounded-lg">
								<p className="text-sm text-purple-700 font-medium">$100 USD</p>
								<p className="text-lg font-bold text-purple-900">
									{formatCurrency(100, settings.usdToNgnRate)}
								</p>
							</div>
							<div className="p-4 bg-orange-50/50 rounded-lg">
								<p className="text-sm text-orange-700 font-medium">$500 USD</p>
								<p className="text-lg font-bold text-orange-900">
									{formatCurrency(500, settings.usdToNgnRate)}
								</p>
							</div>
						</div>
					</div>

					<div className="mt-6 p-4 bg-yellow-50/50 border border-yellow-200 rounded-lg">
						<div className="flex items-start">
							<AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
							<div>
								<p className="text-sm text-yellow-800 font-medium">Important Note</p>
								<p className="text-sm text-yellow-700 mt-1">
									This rate affects how product prices are displayed to customers. Products are stored in USD
									and converted to NGN using this rate.
								</p>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default AdminSystem;
