import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Everything loaded (staff get private and inactive products from /products/admin/all)
export const selectAllProducts = (state: RootState) => state.product.products;

// Storefront view: never show private-sale or inactive products, even to logged-in staff
export const selectProducts = createSelector([selectAllProducts], (products) =>
	products.filter((p) => p.isActive !== false && p.visibility !== "private"),
);
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
