import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

export const selectProducts = (state: RootState) => state.product.products;
// selectors/products.ts
export const selectFeaturedProducts = createSelector([selectProducts], (products) =>
	products.filter((p) => p.isFeatured),
);

// selectors/products.ts
export const selectNewProducts = createSelector([selectProducts], (products) =>
	products.filter((p) => p.isNewProduct),
);

export const selectSelectedProduct = (state: RootState) => state.product.selectedProduct;
export const selectProductLoading = (state: RootState) => state.product.loading;
export const selectProductError = (state: RootState) => state.product.error;
export const selectHasBeenFetched = (state: RootState) => state.product.hasBeenFetched;
