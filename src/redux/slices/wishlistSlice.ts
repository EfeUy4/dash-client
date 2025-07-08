import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { syncWishlistToServer } from "../thunks/wishlist";

export interface WishlistState {
	ids: string[];
	loading: boolean;
	error: string | null;
}

const initialState: WishlistState = {
	ids: [],
	loading: false,
	error: null,
};

const wishlistSlice = createSlice({
	name: "wishlist",
	initialState,
	reducers: {
		setWishlist: (state, action: PayloadAction<string[]>) => {
			state.ids = action.payload;
			localStorage.setItem("wishlist", JSON.stringify(action.payload));
		},
		toggleWishlist: (state, action: PayloadAction<string>) => {
			const productId = action.payload;
			const index = state.ids.indexOf(productId);

			if (index > -1) {
				// Remove if exists
				state.ids.splice(index, 1);
			} else {
				// Add if doesn't exist
				if (typeof productId === "string") {
					state.ids.push(productId.toString());
				}
			}

			localStorage.setItem("wishlist", JSON.stringify(state.ids));
		},
		resetWishlist: (state) => {
			state.ids = [];
			localStorage.removeItem("wishlist");
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(syncWishlistToServer.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(syncWishlistToServer.fulfilled, (state, action) => {
				state.loading = false;
				state.error = null;
				state.ids = action.payload || [];
			})
			.addCase(syncWishlistToServer.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			});
	},
});

export const { setWishlist, toggleWishlist, resetWishlist } = wishlistSlice.actions;

export default wishlistSlice.reducer;
