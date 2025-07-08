import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectOrders } from "@/redux/selectors/ordersSelectors";
import { selectProducts } from "@/redux/selectors/productsSelectors";
import { fetchOrders } from "@/redux/thunks/orders";
import { fetchProducts } from "@/redux/thunks/products";
import { useEffect } from "react";

export function useInitialData() {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectProducts);
	const orders = useAppSelector(selectOrders);
	const { user } = useAuth();

	useEffect(() => {
		if (!products.length) {
			dispatch(fetchProducts());
		}
		if (user) {
			if (user.role !== "customer" && !orders.length) {
				dispatch(fetchOrders());
			}
		}
	}, [dispatch, products.length, orders.length, user?.role]);
}
