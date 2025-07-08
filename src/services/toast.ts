import { useToast } from "@/components/ui/Toaster";

export const useToastUtils = () => {
	const { addToast } = useToast();

	const showSuccessToast = (message?: string, duration?: number) => {
		addToast({
			type: "success",
			title: "Success!",
			message: message || "Your action was completed successfully.",
			duration: duration || 3000,
		});
	};

	const showErrorToast = (error?: string) => {
		addToast({
			type: "error",
			title: "Error",
			message: error || "Something went wrong. Please try again.",
		});
	};

	const showWarningToast = (message?: string) => {
		addToast({
			type: "warning",
			title: "Warning",
			message: message || "Please check your input and try again.",
		});
	};

	const showInfoToast = (message?: string) => {
		addToast({
			type: "info",
			title: "Info",
			message: message || "Here's some information for you.",
		});
	};

	return {
		showSuccessToast,
		showErrorToast,
		showWarningToast,
		showInfoToast,
	};
};
