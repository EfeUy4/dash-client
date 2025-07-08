// store/products/slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/data/types";
import { fetchProducts, fetchProduct, createProduct, updateProduct, deleteProduct } from "../thunks/products";

export interface ProductState {
	products: Product[];
	selectedProduct: Product | null;
	loading: boolean;
	error: string | null;
	hasBeenFetched: boolean;
}

export const initialState: ProductState = {
	products: [],
	selectedProduct: null,
	loading: false,
	error: null,
	hasBeenFetched: false,
};

const productSlice = createSlice({
	name: "products",
	initialState,
	reducers: {
		applyUpdatedProduct: (state, action: PayloadAction<Product>) => {
			const index = state.products.findIndex((p) => p.id === action.payload.id);
			if (index !== -1) {
				state.products[index] = action.payload;
			} else {
				state.products.push(action.payload); // fallback if it's new
			}
		},
		addNewProduct: (state, action: PayloadAction<Product>) => {
			const exists = state.products.find((p) => p.id === action.payload.id);
			if (!exists) {
				state.products.unshift(action.payload);
			}
		},
		resetProductState: (state) => {
			state.products = [];
			state.selectedProduct = null;
			state.loading = false;
			state.error = null;
			state.hasBeenFetched = false;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.loading = false;
				state.products = action.payload;
				state.error = null;
				state.hasBeenFetched = true;
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(fetchProduct.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchProduct.fulfilled, (state, action) => {
				state.loading = false;
				state.selectedProduct = action.payload;
				state.error = null;
			})
			.addCase(fetchProduct.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(createProduct.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(createProduct.fulfilled, (state, action) => {
				state.loading = false;
				state.products.unshift(action.payload); // or push()
				state.error = null;
			})
			.addCase(createProduct.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(updateProduct.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(updateProduct.fulfilled, (state, action) => {
				state.loading = false;
				const index = state.products.findIndex((p) => p.id === action.payload.id);
				if (index !== -1) state.products[index] = action.payload;
				state.error = null;
			})
			.addCase(updateProduct.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			.addCase(deleteProduct.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(deleteProduct.fulfilled, (state, action) => {
				state.loading = false;
				state.products = state.products.filter((p) => p.id !== action.payload);
				state.error = null;
			})
			.addCase(deleteProduct.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { applyUpdatedProduct, addNewProduct, resetProductState } = productSlice.actions;

export default productSlice.reducer;
