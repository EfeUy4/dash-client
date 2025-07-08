// pages/dashboard/AdminSystem.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Save, Settings, Bell, Globe } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const AdminSystem = () => {
	const [activeTab, setActiveTab] = useState("general");
	const [isLoading, setIsLoading] = useState(false);
	const [settings, setSettings] = useState({
		// General settings
		siteName: "Dash",
		siteDescription: "Luxury Fashion & Accessories",
		contactEmail: "hello@dashngshop.com",
		contactPhone: "+234 800 DASH NGS",
		address: "123 Luxury Avenue, Victoria Island, Lagos, Nigeria",

		// Notifications
		emailNotifications: true,
		orderNotifications: true,
		inventoryAlerts: true,
		customerMessages: true,

		// Business
		currency: "NGN",
		timezone: "Africa/Lagos",
		taxRate: 7.5,
		shippingThreshold: 50000,
		shippingCost: 2500,
	});

	const tabs = [
		{ id: "general", name: "General", icon: Settings },
		{ id: "notifications", name: "Notifications", icon: Bell },
		{ id: "business", name: "Business", icon: Globe },
	];

	const handleSettingChange = (key: string, value: any) => {
		setSettings((prev) => ({ ...prev, [key]: value }));
	};

	const handleSave = async () => {
		setIsLoading(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setIsLoading(false);
	};

	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
			minimumFractionDigits: 0,
		}).format(price);
	};

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-serif font-bold text-neutral-900">Settings</h1>
					<p className="text-neutral-600">Manage your store configuration and preferences</p>
				</div>
				<Button onClick={handleSave} isLoading={isLoading}>
					<Save className="w-4 h-4 mr-2" />
					Save Changes
				</Button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
				{/* Sidebar */}
				<div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 h-fit">
					<nav className="space-y-1">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
									activeTab === tab.id
										? "bg-neutral-100 text-neutral-900 font-medium"
										: "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
								}`}
							>
								<tab.icon className="w-4 h-4" />
								<span>{tab.name}</span>
							</button>
						))}
					</nav>
				</div>

				{/* Content */}
				<div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-neutral-200">
					<div className="p-6">
						<motion.div
							key={activeTab}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.3 }}
						>
							{/* General Settings */}
							{activeTab === "general" && (
								<div className="space-y-6">
									<h2 className="text-xl font-serif font-semibold text-neutral-900">General Settings</h2>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Input
											label="Site Name"
											value={settings.siteName}
											onChange={(e) => handleSettingChange("siteName", e.target.value)}
										/>
										<Input
											label="Contact Email"
											type="email"
											value={settings.contactEmail}
											onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
										/>
									</div>

									<Input
										label="Site Description"
										value={settings.siteDescription}
										onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
									/>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<Input
											label="Contact Phone"
											value={settings.contactPhone}
											onChange={(e) => handleSettingChange("contactPhone", e.target.value)}
										/>
									</div>

									<Input
										label="Business Address"
										value={settings.address}
										onChange={(e) => handleSettingChange("address", e.target.value)}
									/>
								</div>
							)}

							{/* Notification Settings */}
							{activeTab === "notifications" && (
								<div className="space-y-6">
									<h2 className="text-xl font-serif font-semibold text-neutral-900">Notification Settings</h2>

									<div className="space-y-4">
										{[
											{
												key: "emailNotifications",
												label: "Email Notifications",
												description: "Receive email updates for important events",
											},
											{
												key: "orderNotifications",
												label: "Order Notifications",
												description: "Get notified when new orders are placed",
											},
											{
												key: "inventoryAlerts",
												label: "Inventory Alerts",
												description: "Receive alerts for low stock items",
											},
											{
												key: "customerMessages",
												label: "Customer Messages",
												description: "Get notified of customer inquiries",
											},
										].map((setting) => (
											<div
												key={setting.key}
												className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
											>
												<div>
													<h3 className="font-medium text-neutral-900">{setting.label}</h3>
													<p className="text-sm text-neutral-600">{setting.description}</p>
												</div>
												<label className="relative inline-flex items-center cursor-pointer">
													<input
														type="checkbox"
														checked={settings[setting.key as keyof typeof settings] as boolean}
														onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
														className="sr-only peer"
													/>
													<div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-neutral-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neutral-600"></div>
												</label>
											</div>
										))}
									</div>
								</div>
							)}

							{/* Business Settings */}
							{activeTab === "business" && (
								<div className="space-y-6">
									<h2 className="text-xl font-serif font-semibold text-neutral-900">Business Settings</h2>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-neutral-700 mb-2">Currency</label>
											<select
												value={settings.currency}
												onChange={(e) => handleSettingChange("currency", e.target.value)}
												className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
											>
												<option value="NGN">Nigerian Naira (₦)</option>
												<option value="USD">US Dollar ($)</option>
												<option value="EUR">Euro (€)</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium text-neutral-700 mb-2">Timezone</label>
											<select
												value={settings.timezone}
												onChange={(e) => handleSettingChange("timezone", e.target.value)}
												className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400"
											>
												<option value="Africa/Lagos">Africa/Lagos (WAT)</option>
												<option value="UTC">UTC</option>
												<option value="America/New_York">America/New_York (EST)</option>
											</select>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
										<Input
											label="Tax Rate (%)"
											type="number"
											step="0.1"
											value={settings.taxRate}
											onChange={(e) => handleSettingChange("taxRate", parseFloat(e.target.value))}
										/>
										<Input
											label="Free Shipping Threshold"
											type="number"
											value={settings.shippingThreshold}
											onChange={(e) => handleSettingChange("shippingThreshold", parseInt(e.target.value))}
											helperText={formatPrice(settings.shippingThreshold)}
										/>
										<Input
											label="Standard Shipping Cost"
											type="number"
											value={settings.shippingCost}
											onChange={(e) => handleSettingChange("shippingCost", parseInt(e.target.value))}
											helperText={formatPrice(settings.shippingCost)}
										/>
									</div>
								</div>
							)}
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminSystem;
