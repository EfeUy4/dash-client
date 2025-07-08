import { userManagementService } from "@/services/userManagementService";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { toggleWishlist } from "../slices/wishlistSlice";

export const syncWishlistToServer = createAsyncThunk<
	string[],
	{ userId: string; ids: string[] },
	{ rejectValue: string }
>("wishlist/syncToServer", async ({ userId, ids }, { rejectWithValue }) => {
	try {
		if (!userId) return;

		const updated = await userManagementService.syncWishlist(userId, ids);
		return updated.wishlist;
	} catch (err: any) {
		return rejectWithValue(err.message);
	}
});


let debounceTimeout: ReturnType<typeof setTimeout>;

export const toggleWishlistAndSync = (productId: string, user?: { id: string }): AppThunk => (dispatch, getState) => {
  dispatch(toggleWishlist(productId));

  const state = getState() as RootState;
  const wishlistIds = state.wishlist.ids;

  if (user) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      dispatch(syncWishlistToServer({ userId: user.id, ids: wishlistIds }));
    }, 500); // wait 500ms after last toggle
  }
};

