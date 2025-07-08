import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToastUtils } from "@/services/toast";
import logo from "../../assets/logo.png";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const { showErrorToast } = useToastUtils();

	const { login, clearError } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		clearError();

		try {
			const user = await login(formData.email, formData.password);

			// Determine the correct redirect path
			const roleRedirects: Record<string, string> = {
				customer: "/customer",
				storekeeper: "/storekeeper",
				salesrep: "/salesrep",
				admin: "/admin",
			};

			if (user) {
				const redirectPath = roleRedirects[user.role] || "/customer";
				navigate(redirectPath, { replace: true });
			} else {
				navigate("/", { replace: true });
			}
		} catch (error: any) {
			showErrorToast(error.message || "Login failed. Please check your credentials and try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({
			...prev,
			[e.target.name]: e.target.value,
		}));
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
						<img src={logo} alt="Dash NG logo" width={120} />
					</Link>
				</div>

				{/* Registration Form */}
				<motion.form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					onSubmit={handleSubmit}
					className="bg-white shadow-lg rounded-lg p-8 space-y-6"
				>
					<h2 className="text-2xl font-serif font-medium text-center text-neutral-900 mb-3">Welcome Back</h2>

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
							placeholder="Enter your email"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								required
								value={formData.password}
								onChange={handleChange}
								className="input w-full pr-10"
								placeholder="Enter your password"
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
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								className="h-4 w-4 text-neutral-600 focus:ring-neutral-500 border-neutral-300 rounded"
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-neutral-700">
								Remember me
							</label>
						</div>

						<Link
							to="/forgot-password"
							className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
						>
							Forgot password?
						</Link>
					</div>

					<button type="submit" disabled={isLoading} className="btn-primary w-full relative">
						{isLoading ? (
							<>
								<Loader2 className="w-4 h-4 animate-spin mr-2" />
								Signing in...
							</>
						) : (
							"Sign In"
						)}
					</button>

					<div className="text-center">
						<span className="text-neutral-600">Don't have an account? </span>
						<Link
							to="/register"
							className="font-medium text-neutral-900 hover:text-primary-600 transition-colors"
						>
							Create one here
						</Link>
					</div>
				</motion.form>
			</motion.div>
		</div>
	);
};

export default LoginPage;
