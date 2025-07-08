import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { selectProducts } from "./productsSelectors";

export const selectWishlistIds = (state: RootState) => state.wishlist.ids;
export const selectWishlistLoading = (state: RootState) => state.wishlist.loading;
export const selectWishlistError = (state: RootState) => state.wishlist.error;

export const selectWishlistProducts = createSelector(
	[selectProducts, selectWishlistIds],
	(products, wishlistIds) => {
		return products.filter((product) => wishlistIds.includes(product.id));
	},
);

export const selectIsInWishlist = (state: RootState, productId: string): boolean => {
	return state.wishlist.ids.includes(productId);
};
