import { useAuth } from "@/contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { selectOrders } from "@/redux/selectors/ordersSelectors";
import { selectAllProducts } from "@/redux/selectors/productsSelectors";
import { fetchOrders } from "@/redux/thunks/orders";
import { fetchProducts } from "@/redux/thunks/products";
import { useEffect, useRef } from "react";

export function useInitialData() {
	const dispatch = useAppDispatch();
	const products = useAppSelector(selectAllProducts);
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

	// Staff see private-sale products: reload the catalog when a staff session starts or ends
	const isStaff = !!user && user.role !== "customer";
	const previousIsStaff = useRef(isStaff);
	useEffect(() => {
		if (previousIsStaff.current !== isStaff) {
			previousIsStaff.current = isStaff;
			dispatch(fetchProducts());
		}
	}, [dispatch, isStaff]);
}
