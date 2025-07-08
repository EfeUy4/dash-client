// selectors/ordersSelectors.ts
import { RootState } from "../store";

export const selectOrders = (state: RootState) => state.order.orders;
export const selectMyOrders = (state: RootState) => state.order.myOrders;
export const selectSelectedOrder = (state: RootState) => state.order.selectedOrder;
export const selectOrderLoading = (state: RootState) => state.order.loading;
export const selectOrderError = (state: RootState) => state.order.error;
export const selectOrderHasBeenFetched = (state: RootState) => state.order.hasBeenFetched;
