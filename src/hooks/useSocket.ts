import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { addNewProduct, applyUpdatedProduct } from "@/redux/slices/productsSlice";
import { addNewOrder, updateOrder, updateOrderStatus } from "@/redux/slices/ordersSlice";
import socket from "@/utils/socket";

export const useSocket = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Connect immediately for public events
		socket.connect();
		socket.emit("join-room", "global-room");

		// Public listeners (e.g., live product updates)
		socket.on("inventory-updated", (product) => {
			dispatch(applyUpdatedProduct(product));
		});

		// Public listeners (e.g., live product updates)
		socket.on("product-created", (product) => {
			dispatch(addNewProduct(product));
		});

		socket.on("order-created", (order) => {
			dispatch(addNewOrder(order));
		});

		socket.on("order-updated", (order) => {
			dispatch(updateOrder(order));
		});

		socket.on("order-status-changed", ({ orderId, status }) => {
			dispatch(updateOrderStatus({ orderId, status }));
		});

		return () => {
			socket.off("product-created");
			socket.off("inventory-updated");
			socket.off("order-created");
			socket.off("order-status-changed");
			socket.disconnect();
		};
	}, []);
};
