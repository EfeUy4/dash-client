import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface LoginResponse {
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		username: string;
		role: "customer" | "salesrep" | "storekeeper" | "admin";
		avatar?: string;
	};
	token: string;
}

class AuthService {
	private token: string | null = null;

	constructor() {
		// Check for token in localStorage
		this.token = localStorage.getItem("dashngshop-token");
		if (this.token) {
			this.setAuthHeader(this.token);
		}
	}

	private setAuthHeader(token: string) {
		axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
	}

	private removeAuthHeader() {
		delete axios.defaults.headers.common["Authorization"];
	}

	async login(email: string, password: string) {
		try {
			const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, {
				email,
				password,
			});

			const { user, token } = response.data;
			this.token = token;

			localStorage.setItem("dashngshop-token", token);
			localStorage.setItem("dashngshop-user", JSON.stringify(user));

			this.setAuthHeader(token);

			return user;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || "Login failed");
			}
			throw new Error("Network error");
		}
	}

	async register(email: string, password: string, firstName: string, lastName: string, username: string) {
		try {
			const response = await axios.post<LoginResponse>(`${API_URL}/auth/register`, {
				email,
				password,
				firstName,
				lastName,
				username,
			});

			const { user, token } = response.data;
			this.token = token;

			localStorage.setItem("dashngshop-token", token);
			localStorage.setItem("dashngshop-user", JSON.stringify(user));

			this.setAuthHeader(token);

			return user;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				throw new Error(error.response?.data?.message || "Registration failed");
			}
			throw new Error("Network error");
		}
	}

	async getCurrentUser() {
		if (!this.token) {
			return null;
		}

		try {
      const response = await axios.get(`${API_URL}/auth/me`);
      console.log("service response", response.data);
			return response.data.user;
    } catch (error) {
			this.logout();
			return null;
		}
	}

	logout() {
		this.token = null;
		localStorage.removeItem("dashngshop-token");
		localStorage.removeItem("dashngshop-user");
		this.removeAuthHeader();
	}

	isAuthenticated() {
		return !!this.token;
	}

	getToken() {
		return this.token;
	}
}

export const authService = new AuthService();
