// store/orders/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { orderService } from "@/services/orderService";
import { Order } from "@/data/types";

interface CreateOrderPayload {
  items: Array<{
    productId: string;
    quantity: number;
    size: string;
    color: string;
  }>;
  shippingAddress: Order["shippingAddress"];
	billingAddress?: {
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
  paymentMethod: string;
  paymentDetails?: any;
}

interface UpdateOrderPayload {
  orderId: string;
  updates: Partial<Pick<Order, 
    | 'status' 
    | 'paymentStatus' 
    | 'trackingNumber' 
    | 'estimatedDelivery' 
    | 'notes'
    | 'updatedAt'
  >>;
}

export const fetchOrders = createAsyncThunk<Order[]>(
  "orders/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await orderService.getOrders();
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch orders");
    }
  }
);

export const fetchMyOrders = createAsyncThunk<Order[]>(
  "orders/fetchMine",
  async (_, thunkAPI) => {
    try {
      return await orderService.getMyOrders();
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch my orders");
    }
  }
);

export const fetchOrder = createAsyncThunk<Order, string>(
  "orders/fetchOne",
  async (id, thunkAPI) => {
    try {
      return await orderService.getOrder(id);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch order");
    }
  }
);

export const createOrder = createAsyncThunk<Order, CreateOrderPayload>(
  "orders/create",
  async (data, thunkAPI) => {
    try {
      return await orderService.createOrder(data);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to create order");
    }
  }
);

export const updateOrder = createAsyncThunk<Order, UpdateOrderPayload>(
  "orders/update",
  async ({ orderId, updates }, thunkAPI) => {
    try {
      return await orderService.updateOrder(orderId, updates);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to update order");
    }
  }
);

export const cancelOrder = createAsyncThunk<Order, { id: string; reason?: string }>(
  "orders/cancel",
  async ({ id, reason }, thunkAPI) => {
    try {
      return await orderService.cancelOrder(id, reason);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to cancel order");
    }
  }
);