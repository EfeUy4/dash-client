// pages/salesrep/SalesRepSettings.tsx
import { useState } from "react";
import { Save, Bell, User, Target } from "lucide-react";

const SalesRepSettings = () => {
	const [settings, setSettings] = useState({
		notifications: {
			orderUpdates: true,
			targetAlerts: true,
			customerMessages: true,
			emailNotifications: false,
			smsNotifications: true,
		},
		targets: {
			monthlyTarget: 2000000,
			weeklyTarget: 500000,
			dailyTarget: 100000,
			autoSetTargets: false,
		},
		profile: {
			displayName: "John Sales Rep",
			phone: "+234 801 234 5678",
			territory: "Lagos",
			commission: 5,
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
					className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
				>
					<Save className="w-4 h-4" />
					<span>Save Changes</span>
				</button>
			</div>

			{/* Profile Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<User className="w-5 h-5 text-green-600" />
					<h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
						<input
							type="text"
							value={settings.profile.displayName}
							onChange={(e) => updateSetting("profile", "displayName", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
						<input
							type="tel"
							value={settings.profile.phone}
							onChange={(e) => updateSetting("profile", "phone", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Territory</label>
						<input
							type="text"
							value={settings.profile.territory}
							onChange={(e) => updateSetting("profile", "territory", e.target.value)}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
						<input
							type="number"
							value={settings.profile.commission}
							onChange={(e) => updateSetting("profile", "commission", parseFloat(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>
				</div>
			</div>

			{/* Target Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Target className="w-5 h-5 text-green-600" />
					<h2 className="text-lg font-semibold text-gray-900">Sales Targets</h2>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Monthly Target (₦)</label>
						<input
							type="number"
							value={settings.targets.monthlyTarget}
							onChange={(e) => updateSetting("targets", "monthlyTarget", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Weekly Target (₦)</label>
						<input
							type="number"
							value={settings.targets.weeklyTarget}
							onChange={(e) => updateSetting("targets", "weeklyTarget", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Daily Target (₦)</label>
						<input
							type="number"
							value={settings.targets.dailyTarget}
							onChange={(e) => updateSetting("targets", "dailyTarget", parseInt(e.target.value))}
							className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
						/>
					</div>
				</div>

				<div className="mt-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Auto-set Targets</h3>
							<p className="text-sm text-gray-600">Automatically adjust targets based on performance</p>
						</div>
						<input
							type="checkbox"
							checked={settings.targets.autoSetTargets}
							onChange={(e) => updateSetting("targets", "autoSetTargets", e.target.checked)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>

			{/* Notification Settings */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
				<div className="flex items-center space-x-3 mb-4">
					<Bell className="w-5 h-5 text-green-600" />
					<h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
				</div>

				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Order Updates</h3>
							<p className="text-sm text-gray-600">Get notified when orders are updated</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.orderUpdates}
							onChange={(e) => updateSetting("notifications", "orderUpdates", e.target.checked)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Target Alerts</h3>
							<p className="text-sm text-gray-600">Get notified about target progress</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.targetAlerts}
							onChange={(e) => updateSetting("notifications", "targetAlerts", e.target.checked)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">Customer Messages</h3>
							<p className="text-sm text-gray-600">Get notified of customer inquiries</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.customerMessages}
							onChange={(e) => updateSetting("notifications", "customerMessages", e.target.checked)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
					</div>

					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-sm font-medium text-gray-900">SMS Notifications</h3>
							<p className="text-sm text-gray-600">Receive notifications via SMS</p>
						</div>
						<input
							type="checkbox"
							checked={settings.notifications.smsNotifications}
							onChange={(e) => updateSetting("notifications", "smsNotifications", e.target.checked)}
							className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SalesRepSettings;
