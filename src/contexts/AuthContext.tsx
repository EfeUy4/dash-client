import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "../services/authService";

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	username: string;
	role: "customer" | "salesrep" | "storekeeper" | "admin";
	avatar?: string;
	wishlist?: any;
	phone?: string;
	createdAt?: string;
}

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	error: string | null;
}

type AuthAction =
	| { type: "AUTH_START" }
	| { type: "AUTH_SUCCESS"; payload: User }
	| { type: "AUTH_ERROR"; payload: string }
	| { type: "AUTH_LOGOUT" }
	| { type: "CLEAR_ERROR" }
	| { type: "UPDATE_USER"; payload: Partial<User> | User };

const initialState: AuthState = {
	user: null,
	isAuthenticated: false,
	isLoading: false,
	error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
	switch (action.type) {
		case "AUTH_START":
			return {
				...state,
				isLoading: true,
				error: null,
			};
		case "AUTH_SUCCESS":
			return {
				...state,
				user: action.payload,
				isAuthenticated: true,
				isLoading: false,
				error: null,
			};
		case "AUTH_ERROR":
			return {
				...state,
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: action.payload,
			};
		case "AUTH_LOGOUT":
			return {
				...state,
				user: null,
				isAuthenticated: false,
				isLoading: false,
				error: null,
			};
		case "CLEAR_ERROR":
			return {
				...state,
				error: null,
			};
		case "UPDATE_USER":
			return {
				...state,
				user: {
					...state.user,
					...action.payload,
				} as User,
			};
		default:
			return state;
	}
};

interface AuthContextType extends AuthState {
	login: (email: string, password: string) => Promise<User>;
	register: (
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		username: string,
	) => Promise<void>;
	logout: () => void;
	clearError: () => void;
	updateUser: (user: Partial<User> | User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(authReducer, initialState);

	useEffect(() => {
		const checkAuth = async () => {
			dispatch({ type: "AUTH_START" });

			const storedUser = localStorage.getItem("dashngshop-user");

			if (storedUser) {
				try {
					const user = JSON.parse(storedUser);
					dispatch({ type: "AUTH_SUCCESS", payload: user });
				} catch (err) {
					dispatch({ type: "AUTH_ERROR", payload: "Failed to restore session" });
				}
			} else {
				const user = await authService.getCurrentUser();
				if (user) {
					localStorage.setItem("dashngshop-user", JSON.stringify(user));
					dispatch({ type: "AUTH_SUCCESS", payload: user });
				} else {
					dispatch({ type: "AUTH_ERROR", payload: "Session expired" });
				}
			}
		};

		checkAuth();
	}, []);

	const login = async (email: string, password: string) => {
		let user = null;
		try {
			dispatch({ type: "AUTH_START" });
			user = await authService.login(email, password);
			dispatch({ type: "AUTH_SUCCESS", payload: user });
		} catch (error) {
			dispatch({ type: "AUTH_ERROR", payload: error instanceof Error ? error.message : "Login failed" });
			throw error;
		}

		return user;
	};

	const register = async (
		email: string,
		password: string,
		firstName: string,
		lastName: string,
		username: string,
	) => {
		try {
			dispatch({ type: "AUTH_START" });
			const user = await authService.register(email, password, firstName, lastName, username);
			dispatch({ type: "AUTH_SUCCESS", payload: user });
		} catch (error) {
			dispatch({
				type: "AUTH_ERROR",
				payload: error instanceof Error ? error.message : "Registration failed",
			});
			throw error;
		}
	};

	const logout = () => {
		authService.logout();
		dispatch({ type: "AUTH_LOGOUT" });
	};

	const clearError = () => {
		dispatch({ type: "CLEAR_ERROR" });
	};

	const updateUser = (updatedUser: Partial<User> | User) => {
		dispatch({ type: "UPDATE_USER", payload: updatedUser });

		// Optional: persist updated user to localStorage
		const newUser = state.user ? { ...state.user, ...updatedUser } : updatedUser;
		localStorage.setItem("dashngshop-user", JSON.stringify(newUser));
	};

	const value: AuthContextType = {
		...state,
		login,
		register,
		logout,
    clearError,
    updateUser
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
