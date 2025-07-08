// services/socketService.ts
import { io, Socket } from "socket.io-client";

class SocketService {
	private socket: Socket | null = null;
	private readonly serverUrl = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

	connect(): void {
		if (!this.socket) {
			this.socket = io(this.serverUrl);

			this.socket.on("connect", () => {
				console.log("Connected to server");
			});

			this.socket.on("disconnect", () => {
				console.log("Disconnected from server");
			});
		}
	}

	disconnect(): void {
		if (this.socket) {
			this.socket.disconnect();
			this.socket = null;
		}
	}

	// Join specific rooms
	joinRoom(room: string): void {
		if (this.socket) {
			this.socket.emit("join-room", room);
		}
	}

	// Listen for inventory updates
	onInventoryUpdate(callback: (data: any) => void): void {
		if (this.socket) {
			this.socket.on("inventory-changed", callback);
		}
	}

	// Listen for order updates
	onOrderUpdate(callback: (data: any) => void): void {
		if (this.socket) {
			this.socket.on("order-status-changed", callback);
		}
	}

	// Listen for new orders (admin)
	onNewOrder(callback: (data: any) => void): void {
		if (this.socket) {
			this.socket.on("order-created", callback);
		}
	}

	// Emit inventory update
	emitInventoryUpdate(data: any): void {
		if (this.socket) {
			this.socket.emit("inventory-update", data);
		}
	}

	// Emit order update
	emitOrderUpdate(data: any): void {
		if (this.socket) {
			this.socket.emit("order-update", data);
		}
	}

	// Remove specific listeners
	removeListener(event: string): void {
		if (this.socket) {
			this.socket.off(event);
		}
	}

	// Check connection status
	isConnected(): boolean {
		return this.socket?.connected || false;
	}
}

export const socketService = new SocketService();
