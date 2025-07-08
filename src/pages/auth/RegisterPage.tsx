import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import logo from "../../assets/logo.png";

const RegisterPage = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
		agreeToTerms: false,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [passwordStrength, setPasswordStrength] = useState(0);

	const { register, error, clearError } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		clearError();

		// Validation
		if (formData.password !== formData.confirmPassword) {
			setIsLoading(false);
			return;
		}

		if (!formData.agreeToTerms) {
			setIsLoading(false);
			return;
		}

		try {
			await register(
				formData.email,
				formData.password,
				formData.firstName,
				formData.lastName,
				formData.username,
			);
			navigate("/customer");
		} catch (error) {
			// Error is handled by the auth context
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Password strength calculation
		if (name === "password") {
			let strength = 0;
			if (value.length >= 8) strength++;
			if (/[A-Z]/.test(value)) strength++;
			if (/[a-z]/.test(value)) strength++;
			if (/[0-9]/.test(value)) strength++;
			if (/[^A-Za-z0-9]/.test(value)) strength++;
			setPasswordStrength(strength);
		}
	};

	const getPasswordStrengthText = () => {
		switch (passwordStrength) {
			case 0:
				return "";
			case 1:
				return "Very Weak";
			case 2:
				return "Weak";
			case 3:
				return "Fair";
			case 4:
				return "Good";
			case 5:
				return "Strong";
			default:
				return "";
		}
	};

	const getPasswordStrengthColor = () => {
		switch (passwordStrength) {
			case 1:
				return "bg-red-500";
			case 2:
				return "bg-orange-500";
			case 3:
				return "bg-yellow-500";
			case 4:
				return "bg-blue-500";
			case 5:
				return "bg-green-500";
			default:
				return "bg-gray-300";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="max-w-md w-full space-y-8"
			>
				{/* Header */}
				<div className="w-fit mb-5 mx-auto">
					{/* Logo */}
					<Link to="/">
						<img
							src={logo}
							alt="Dash NG logo"
							width={120}
						/>
					</Link>
				</div>

				{/* Error Message */}
				{error && (
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="bg-red-50 border border-red-200 rounded-lg p-4"
					>
						<p className="text-red-700 text-sm">{error}</p>
					</motion.div>
				)}

				{/* Registration Form */}
				<motion.form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					onSubmit={handleSubmit}
					className="bg-white shadow-lg rounded-lg p-8 space-y-6"
				>
					<h2 className="text-2xl font-serif font-medium text-center text-neutral-900 mb-3">
						Create Your Account
					</h2>
					{/* Name Fields */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
								First Name
							</label>
							<input
								id="firstName"
								name="firstName"
								type="text"
								required
								value={formData.firstName}
								onChange={handleChange}
								className="input w-full"
								placeholder="John"
							/>
						</div>
						<div>
							<label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
								Last Name
							</label>
							<input
								id="lastName"
								name="lastName"
								type="text"
								required
								value={formData.lastName}
								onChange={handleChange}
								className="input w-full"
								placeholder="Doe"
							/>
						</div>
					</div>

					{/* Username */}
					<div>
						<label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
							Username
						</label>
						<input
							id="username"
							name="username"
							type="text"
							required
							value={formData.username}
							onChange={handleChange}
							className="input w-full"
							placeholder="storm"
						/>
					</div>

					{/* Email */}
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
							Email Address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							required
							value={formData.email}
							onChange={handleChange}
							className="input w-full"
							placeholder="john@example.com"
						/>
					</div>

					{/* Password */}
					<div>
						<label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								autoComplete="new-password"
								required
								value={formData.password}
								onChange={handleChange}
								className="input w-full pr-10"
								placeholder="Create a strong password"
							/>
							<button
								type="button"
								onClick={() => setShowPassword(!showPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								{showPassword ? (
									<EyeOff className="w-4 h-4 text-neutral-400" />
								) : (
									<Eye className="w-4 h-4 text-neutral-400" />
								)}
							</button>
						</div>

						{/* Password Strength */}
						{formData.password && (
							<div className="mt-2">
								<div className="flex items-center space-x-2">
									<div className="flex-1 bg-gray-200 rounded-full h-2">
										<div
											className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
											style={{ width: `${(passwordStrength / 5) * 100}%` }}
										/>
									</div>
									<span className="text-xs text-neutral-500">{getPasswordStrengthText()}</span>
								</div>
							</div>
						)}
					</div>

					{/* Confirm Password */}
					<div>
						<label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
							Confirm Password
						</label>
						<div className="relative">
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								autoComplete="new-password"
								required
								value={formData.confirmPassword}
								onChange={handleChange}
								className={`input w-full pr-10 ${
									formData.confirmPassword && formData.password !== formData.confirmPassword
										? "border-red-300 focus:ring-red-500"
										: ""
								}`}
								placeholder="Confirm your password"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute inset-y-0 right-0 pr-3 flex items-center"
							>
								{showConfirmPassword ? (
									<EyeOff className="w-4 h-4 text-neutral-400" />
								) : (
									<Eye className="w-4 h-4 text-neutral-400" />
								)}
							</button>
						</div>
						{formData.confirmPassword && formData.password !== formData.confirmPassword && (
							<p className="mt-1 text-sm text-red-600">Passwords do not match</p>
						)}
					</div>

					{/* Terms Agreement */}
					<div className="flex items-start">
						<div className="flex items-center h-5">
							<input
								id="agreeToTerms"
								name="agreeToTerms"
								type="checkbox"
								checked={formData.agreeToTerms}
								onChange={handleChange}
								className="h-4 w-4 text-neutral-600 focus:ring-neutral-500 border-neutral-300 rounded"
							/>
						</div>
						<div className="ml-3">
							<label htmlFor="agreeToTerms" className="text-sm text-neutral-700">
								I agree to the{" "}
								<Link
									to="/terms"
									className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									to="/privacy"
									className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
								>
									Privacy Policy
								</Link>
							</label>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading || !formData.agreeToTerms || formData.password !== formData.confirmPassword}
						className="btn-primary w-full relative disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
								Creating Account...
							</>
						) : (
							"Create Account"
						)}
					</button>

					<div className="text-center">
						<span className="text-neutral-600">Already have an account? </span>
						<Link
							to="/login"
							className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
						>
							Sign in here
						</Link>
					</div>
				</motion.form>
			</motion.div>
		</div>
	);
};

export default RegisterPage;
