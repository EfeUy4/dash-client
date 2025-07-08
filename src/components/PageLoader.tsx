import logo from "../assets/logo.png";

const PageLoader = () => {
	return (
		<div className="w-screen h-screen fixed inset-0 bg-white flex items-center justify-center">
			<div className="w-36 h-36 flex items-center justify-center relative">
				<img
					src={logo}
					alt="Logo"
					className="w-24 animate-pulse z-10"
					style={{
						filter: "brightness(0.8)",
						animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
					}}
				/>

				{/* Cool spinner ring */}
				<div
					className="w-full h-full border-2 border-gray-200 rounded-full animate-spin absolute top-0 left-0"
					style={{
						borderTopColor: "#9ca3af",
						animation: "spin 3s linear infinite",
					}}
				></div>
			</div>
		</div>
	);
};

export default PageLoader;
