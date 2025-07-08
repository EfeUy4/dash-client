import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import productReducer from './slices/productsSlice';
import orderReducer from './slices/ordersSlice';
import wishlistReducer from './slices/wishlistSlice';

const store = configureStore({
  reducer: {
    product: productReducer,
    order: orderReducer,
    wishlist: wishlistReducer
  },
})

export default store;
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;
