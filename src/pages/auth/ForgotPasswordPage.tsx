import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useToastUtils } from "@/services/toast";
import { authService } from "@/services/authService";
import logo from "../../assets/logo.png";

type Step = "request" | "reset" | "success";

const ForgotPasswordPage = () => {
	const [step, setStep] = useState<Step>("request");
	const [email, setEmail] = useState("");
	const [otp, setOtp] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { showSuccessToast, showErrorToast } = useToastUtils();
	const navigate = useNavigate();

	const handleRequestCode = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await authService.requestPasswordResetOtp(email);
			showSuccessToast("Reset code sent to your email");
			setStep("reset");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to send reset code");
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			showErrorToast("Passwords do not match");
			return;
		}

		if (newPassword.length < 6) {
			showErrorToast("Password must be at least 6 characters");
			return;
		}

		setIsLoading(true);

		try {
			await authService.resetPasswordWithOtp(email, otp, newPassword);
			showSuccessToast("Password reset successful");
			setStep("success");
		} catch (error: any) {
			showErrorToast(error.message || "Failed to reset password");
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoToLogin = () => {
		navigate("/login", { replace: true });
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.6 }}
				className="max-w-md w-full space-y-8"
			>
				<div className="w-fit mb-5 mx-auto">
					<Link to="/">
						<img src={logo} alt="Dash NG logo" width={120} />
					</Link>
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="bg-white shadow-lg rounded-lg p-8 space-y-6"
				>
					{step === "request" && (
						<>
							<h2 className="text-2xl font-serif font-medium text-center text-neutral-900 mb-3">
								Forgot Password
							</h2>
							<p className="text-sm text-neutral-600 text-center">
								Enter your email and we will send you a reset code.
							</p>

							<form onSubmit={handleRequestCode} className="space-y-4">
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
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="input w-full"
										placeholder="Enter your email"
									/>
								</div>

								<button type="submit" disabled={isLoading} className="btn-primary w-full relative">
									{isLoading ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin mr-2" />
											Sending code...
										</>
									) : (
										"Send Reset Code"
									)}
								</button>
							</form>

							<div className="text-center">
								<Link
									to="/login"
									className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
								>
									Back to login
								</Link>
							</div>
						</>
					)}

					{step === "reset" && (
						<>
							<h2 className="text-2xl font-serif font-medium text-center text-neutral-900 mb-3">
								Reset Password
							</h2>
							<p className="text-sm text-neutral-600 text-center">
								Enter the 6-digit code sent to {email}.
							</p>

							<form onSubmit={handleResetPassword} className="space-y-4">
								<div>
									<label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-2">
										Reset Code
									</label>
									<input
										id="otp"
										name="otp"
										type="text"
										inputMode="numeric"
										pattern="[0-9]*"
										maxLength={6}
										required
										value={otp}
										onChange={(e) => setOtp(e.target.value)}
										className="input w-full"
										placeholder="Enter the code"
									/>
								</div>

								<div>
									<label
										htmlFor="newPassword"
										className="block text-sm font-medium text-neutral-700 mb-2"
									>
										New Password
									</label>
									<input
										id="newPassword"
										name="newPassword"
										type="password"
										required
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="input w-full"
										placeholder="Enter new password"
									/>
								</div>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-neutral-700 mb-2"
									>
										Confirm Password
									</label>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="input w-full"
										placeholder="Confirm new password"
									/>
								</div>

								<button type="submit" disabled={isLoading} className="btn-primary w-full relative">
									{isLoading ? (
										<>
											<Loader2 className="w-4 h-4 animate-spin mr-2" />
											Resetting...
										</>
									) : (
										"Reset Password"
									)}
								</button>
							</form>
						</>
					)}

					{step === "success" && (
						<>
							<h2 className="text-2xl font-serif font-medium text-center text-neutral-900 mb-3">
								Password Reset
							</h2>
							<p className="text-sm text-neutral-600 text-center">
								Your password has been reset successfully.
							</p>
							<button onClick={handleGoToLogin} className="btn-primary w-full">
								Go to Login
							</button>
						</>
					)}
				</motion.div>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
