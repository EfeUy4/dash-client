import { useEffect } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { addNewProduct, applyUpdatedProduct, deleteProductLocally } from "@/redux/slices/productsSlice";
import { addNewOrder, updateOrder, updateOrderStatus } from "@/redux/slices/ordersSlice";
import socket from "@/utils/socket";

export const useSocket = () => {
	const dispatch = useAppDispatch();

	useEffect(() => {
		// Connect immediately for public events
		socket.connect();
		socket.emit("join-room", "global-room");

		// Product listeners
		socket.on("inventory-updated", (product) => {
			console.log("Product inventory updated:", product);
			dispatch(applyUpdatedProduct(product));
		});

		socket.on("product-created", (product) => {
			console.log("New product created:", product);
			dispatch(addNewProduct(product));
		});

		// ✅ FIXED: Use correct action for product deletion
		socket.on("product-deleted", (productId) => {
			console.log("Product deleted:", productId);
			dispatch(deleteProductLocally(productId));
		});

		// Order listeners
		socket.on("order-created", (order) => {
			console.log("New order created:", order);
			dispatch(addNewOrder(order));
		});

		socket.on("order-updated", (order) => {
			console.log("Order updated:", order);
			dispatch(updateOrder(order));
		});

		socket.on("order-status-changed", ({ orderId, status }) => {
			console.log("Order status changed:", { orderId, status });
			dispatch(updateOrderStatus({ orderId, status }));
		});

		// Error handling
		socket.on("connect_error", (error) => {
			console.error("Socket connection error:", error);
		});

		socket.on("disconnect", (reason) => {
			console.log("Socket disconnected:", reason);
		});

		return () => {
			// Clean up all listeners
			socket.off("product-created");
			socket.off("inventory-updated");
			socket.off("product-deleted");
			socket.off("order-created");
			socket.off("order-updated");
			socket.off("order-status-changed");
			socket.off("connect_error");
			socket.off("disconnect");
			socket.disconnect();
		};
	}, [dispatch]);

	return socket;
};