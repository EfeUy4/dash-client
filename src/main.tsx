import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import "./index.css";
import { ToastProvider } from "./components/ui/Toaster.tsx";
import { Provider } from "react-redux";
import store from "./redux/store";
import WishlistWrapper from "./components/WishlistWrapper.tsx";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<ToastProvider>
					<BrowserRouter>
						<AuthProvider>
							<CartProvider>
								<WishlistWrapper />
								<App />
							</CartProvider>
						</AuthProvider>
					</BrowserRouter>
				</ToastProvider>
			</QueryClientProvider>
		</Provider>
);
