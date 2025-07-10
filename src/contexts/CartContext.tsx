import React, { createContext, useContext, useReducer, useEffect } from "react";

export interface CartItem {
	id: string;
	productId: string;
	name: string;
	price: number;
	image: string;
	size: string;
	color: string;
	quantity: number;
	maxStock: number;
}

interface CartState {
	items: CartItem[];
	total: number;
	itemCount: number;
	isLoading: boolean;
}

type CartAction =
	| { type: "ADD_ITEM"; payload: Omit<CartItem, "quantity" | "id"> & { quantity?: number } }
	| { type: "REMOVE_ITEM"; payload: string }
	| { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
	| { type: "CLEAR_CART" }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "LOAD_CART"; payload: CartItem[] };

const initialState: CartState = {
	items: [],
	total: 0,
	itemCount: 0,
	isLoading: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
	switch (action.type) {
		case "ADD_ITEM": {
			const existingItem = state.items.find(
				(item) =>
					item.id === action.payload.productId &&
					item.size === action.payload.size &&
					item.color === action.payload.color,
			);

			let newItems: CartItem[];

			if (existingItem) {
				const newQuantity = Math.min(
					existingItem.quantity + (action.payload.quantity || 1),
					existingItem.maxStock,
				);
				newItems = state.items.map((item) =>
					item.id === existingItem.id ? { ...item, quantity: newQuantity } : item,
				);
			} else {
				const newItem: CartItem = {
          ...action.payload,
          id: action.payload.productId,
					quantity: action.payload.quantity || 1,
				};
				newItems = [...state.items, newItem];
			}

			const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
			const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

			return {
				...state,
				items: newItems,
				total,
				itemCount,
			};
		}

		case "REMOVE_ITEM": {
			const newItems = state.items.filter((item) => item.id !== action.payload);
			const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
			const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

			return {
				...state,
				items: newItems,
				total,
				itemCount,
			};
		}

		case "UPDATE_QUANTITY": {
			const newItems = state.items.map((item) =>
				item.id === action.payload.id
					? { ...item, quantity: Math.min(Math.max(1, action.payload.quantity), item.maxStock) }
					: item,
			);
			const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
			const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

			return {
				...state,
				items: newItems,
				total,
				itemCount,
			};
		}

		case "CLEAR_CART":
			return {
				...state,
				items: [],
				total: 0,
				itemCount: 0,
			};

		case "SET_LOADING":
			return {
				...state,
				isLoading: action.payload,
			};

		case "LOAD_CART": {
			const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0);

			return {
				...state,
				items: action.payload,
				total,
				itemCount,
			};
		}

		default:
			return state;
	}
};

interface CartContextType extends CartState {
	addItem: (item: Omit<CartItem, "quantity" | "id"> & { quantity?: number }) => void;
	removeItem: (id: string) => void;
	updateQuantity: (id: string, quantity: number) => void;
	clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};

interface CartProviderProps {
	children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const [state, dispatch] = useReducer(cartReducer, initialState);

	useEffect(() => {
		try {
      const savedCart = localStorage.getItem("dashngshop-cart");
      console.log("Loading cart from localStorage:", savedCart);
			if (savedCart) {
				const cartData = JSON.parse(savedCart);
				dispatch({ type: "LOAD_CART", payload: cartData });
			}
		} catch (error) {
			console.error("Error loading cart:", error);
		}
	}, []);

	// Save cart to localStorage whenever it changes
	useEffect(() => {
		try {
			localStorage.setItem("dashngshop-cart", JSON.stringify(state.items));
		} catch (error) {
			console.error("Error saving cart:", error);
		}
	}, [state.items]);

	const addItem = (item: Omit<CartItem, "quantity" | "id"> & { quantity?: number }) => {
		dispatch({ type: "ADD_ITEM", payload: item });
	};

	const removeItem = (id: string) => {
		dispatch({ type: "REMOVE_ITEM", payload: id });
	};

	const updateQuantity = (id: string, quantity: number) => {
		dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
	};

	const clearCart = () => {
		dispatch({ type: "CLEAR_CART" });
		localStorage.removeItem("dashngshop-cart");
	};

	const value: CartContextType = {
		...state,
		addItem,
		removeItem,
		updateQuantity,
		clearCart,
	};

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
