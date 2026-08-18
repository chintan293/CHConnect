import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : "/";

export const useAuthStore = create((set , get) => ({
    authUser: null,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async (getToken) => {
        set({ isCheckingAuth: true });

        try {
            const token = getToken ? await getToken() : null;
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await axiosInstance.get("/auth/check", { headers });
            set({ authUser: res.data });

            get().connectSocket(res.data);
        }catch (error) {
            console.error("Error in checkAuth:" , error);
            set({ authUser: null });
        }finally {
            set({ isCheckingAuth: false });
        }
    },

    clearAuth: () => {
        set({ authUser: null, isCheckingAuth: false, onlineUsers: [] });
        get().disconnectSocket();
    },

    connectSocket: (user) => {
        if (!user || get().socket?.connected) return;

        const socket = io(BASE_URL, { query: { userId: user._id } });

        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) socket.disconnect();
        set({ socket: null });
    },
}));