import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { setWishlist } from "@/redux/slices/wishlistSlice";
import { syncWishlistToServer } from "@/redux/thunks/wishlist";
import { useAppDispatch } from "@/redux/hooks";

const WishlistWrapper = () => {
	const dispatch = useAppDispatch();
	const { user } = useAuth();

	useEffect(() => {
    const localIds = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const validLocalIds = localIds.filter((id: string) => typeof id === "string" && id.trim() !== "");

		if (!user) {
			dispatch(setWishlist(validLocalIds));
		} else {
			const serverIds = [...new Set(user.wishlist || [])];
			const merged = [...new Set([...validLocalIds, ...serverIds])];
			const forceSync = merged.length !== serverIds.length;

			dispatch(setWishlist(merged));
			if (forceSync) {
				dispatch(syncWishlistToServer({ userId: user.id, ids: merged }));
			}
		}
	}, [dispatch, user]);

	return null;
};

export default WishlistWrapper;
