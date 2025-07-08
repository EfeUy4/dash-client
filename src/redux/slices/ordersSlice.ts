// store/orders/slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "@/data/types";
import { fetchOrders, fetchMyOrders, fetchOrder, createOrder, updateOrder as updateOrderThunk, cancelOrder } from "../thunks/orders";

export interface OrderState {
	orders: Order[];
	myOrders: Order[];
	selectedOrder: Order | null;
	loading: boolean;
	error: string | null;
	hasBeenFetched: boolean;
}

export const initialState: OrderState = {
	orders: [],
	myOrders: [],
	selectedOrder: null,
	loading: false,
	error: null,
	hasBeenFetched: false,
};

const orderSlice = createSlice({
	name: "orders",
	initialState,
	reducers: {
		updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
			const index = state.orders.findIndex((o) => o.id === action.payload.orderId);
			if (index !== -1) {
				state.orders[index].status = action.payload.status as Order["status"];
			}
		},
		updateOrder: (state, action: PayloadAction<Order>) => {
			const index = state.orders.findIndex((o) => o.id === action.payload.id);
			if (index !== -1) {
				state.orders[index] = action.payload;
			}
			
			// Also update in myOrders if it exists
			const myOrderIndex = state.myOrders.findIndex((o) => o.id === action.payload.id);
			if (myOrderIndex !== -1) {
				state.myOrders[myOrderIndex] = action.payload;
			}
			
			// Update selectedOrder if it's the same order
			if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
				state.selectedOrder = action.payload;
			}
		},
		addNewOrder: (state, action: PayloadAction<Order>) => {
			// Check if order already exists to prevent duplicates
			const existingIndex = state.orders.findIndex((o) => o.id === action.payload.id);
			if (existingIndex === -1) {
				state.orders.unshift(action.payload); // Add new order to top only if it doesn't exist
			}
		},
		resetOrderState: (state) => {
			state.orders = [];
			state.myOrders = [];
			state.selectedOrder = null;
			state.loading = false;
			state.error = null;
			state.hasBeenFetched = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrders.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchOrders.fulfilled, (state, action) => {
				state.loading = false;
				state.orders = action.payload;
				state.hasBeenFetched = true;
				state.error = null;
			})
			.addCase(fetchOrders.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchMyOrders.fulfilled, (state, action) => {
				state.myOrders = action.payload;
			})
			.addCase(fetchOrder.fulfilled, (state, action) => {
				state.selectedOrder = action.payload;
			})
			.addCase(createOrder.fulfilled, (state, action) => {
				// Check for duplicates before adding
				const existingIndex = state.orders.findIndex((o) => o.id === action.payload.id);
				if (existingIndex === -1) {
					state.orders.unshift(action.payload); // Add new order to top
				}
			})
			.addCase(updateOrderThunk.fulfilled, (state, action) => {
				const index = state.orders.findIndex((o) => o.id === action.payload.id);
				if (index !== -1) {
					state.orders[index] = action.payload;
				}
				
				// Also update in myOrders if it exists
				const myOrderIndex = state.myOrders.findIndex((o) => o.id === action.payload.id);
				if (myOrderIndex !== -1) {
					state.myOrders[myOrderIndex] = action.payload;
				}
				
				// Update selectedOrder if it's the same order
				if (state.selectedOrder && state.selectedOrder.id === action.payload.id) {
					state.selectedOrder = action.payload;
				}
			})
			.addCase(cancelOrder.fulfilled, (state, action) => {
				const index = state.orders.findIndex((o) => o.id === action.payload.id);
				if (index !== -1) {
					state.orders[index] = action.payload;
				}
			});
	},
});

export const { updateOrderStatus, updateOrder, addNewOrder, resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;