import { create } from "zustand";
import { persist } from "zustand/middleware";

import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useChatStore = create(
  persist(
    (set, get) => ({
      users: [],
      conversations: [],
      messages: [],
      selectedUser: null,
      isConversationsLoading: false,
      isUsersLoading: false,
      isMessagesLoading: false,
      activeConversationId: null,
      searchQuery: "",
      sidebarTab: "chats",
      composerText: "",
      isSoundEnabled: true,
      isSendingMedia: false,
      isSendingMedia: false,
      uploadProgress: 0,
      typingUsers: {},

      setUploadProgress: (uploadProgress) => set({ uploadProgress }),

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set((state) => ({
            users: res.data,
            selectedUser:
              state.selectedUser && res.data.some((user) => user._id === state.selectedUser._id)
                ? state.selectedUser
                : null,
          }));
        } catch (error) {
          console.log("Error in get Users", error.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getConversations: async () => {
        set({ isConversationsLoading: true });
        try {
          const res = await axiosInstance.get("/messages/conversations");
          set({ conversations: res.data });
        } catch (error) {
          console.log("Error in getConversations", error.message);
        } finally {
          set({ isConversationsLoading: false });
        }
      },

      getMessages: async (userId) => {
        if (!userId) return;
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
          get().markMessagesAsRead(userId);
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to load messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      markMessagesAsRead: async (senderId) => {
        if (!senderId) return;
        try {
          await axiosInstance.put(`/messages/read/${senderId}`);
          set((state) => ({
            messages: state.messages.map((msg) =>
              String(msg.senderId) === String(senderId) ? { ...msg, isRead: true, status: "read" } : msg
            ),
          }));
        } catch (error) {
          console.log("Failed to mark messages as read", error);
        }
      },

      sendMessage: async (messageData, clientId = null) => {
        const { selectedUser, messages } = get();
        if (!selectedUser) return false;

        const isFormData = messageData instanceof FormData;

        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData, {
            onUploadProgress: (progressEvent) => {
              if (isFormData) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                get().setUploadProgress(percentCompleted);
              }
            }
          });

          const savedMessage = res.data;

          set((state) => {
            // Reconcile optimistic message
            let newMessages = [...state.messages];
            if (clientId) {
              const optIndex = newMessages.findIndex((msg) => msg.clientId === clientId);
              if (optIndex !== -1) {
                newMessages[optIndex] = savedMessage;
              } else {
                newMessages.push(savedMessage);
              }
            } else {
              // Deduplicate just in case
              const exists = newMessages.find(m => m._id === savedMessage._id);
              if(!exists) newMessages.push(savedMessage);
            }
            return { messages: newMessages, composerText: "" };
          });
          get().getConversations();
          return true;
        } catch (error) {
          console.error("Failed to send message", error);
          toast.error(error.response?.data?.message || "Failed to send message");
          
          set((state) => {
             if (clientId) {
               return {
                 messages: state.messages.map(msg => 
                    msg.clientId === clientId ? { ...msg, status: "failed" } : msg
                 )
               }
             }
             return state;
          });

          return false;
        } finally {
          if (isFormData) get().setUploadProgress(0);
        }
      },

      sendTyping: (receiverId) => {
        const socket = useAuthStore.getState().socket;
        if (socket && receiverId) {
          socket.emit("typing", { receiverId });
        }
      },

      sendStopTyping: (receiverId) => {
        const socket = useAuthStore.getState().socket;
        if (socket && receiverId) {
          socket.emit("stopTyping", { receiverId });
        }
      },

      subscribeToMessages: (userId) => {
        if (!userId) return;

        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.off("newMessage");
        socket.off("typing");
        socket.off("stopTyping");
        socket.off("messagesRead");

        socket.on("newMessage", (newMessage) => {
          if (String(newMessage.senderId) !== String(userId)) return;

          set((state) => {
             // Prevent duplicates via clientId or _id
             const exists = state.messages.some(m => m._id === newMessage._id || (m.clientId && m.clientId === newMessage.clientId));
             if (exists) return state;
             return { messages: [...state.messages, newMessage] };
          });
          get().markMessagesAsRead(userId);
        });

        socket.on("typing", ({ senderId }) => {
          set((state) => ({
            typingUsers: { ...state.typingUsers, [senderId]: true },
          }));
        });

        socket.on("stopTyping", ({ senderId }) => {
          set((state) => ({
            typingUsers: { ...state.typingUsers, [senderId]: false },
          }));
        });

        socket.on("messagesRead", ({ readerId }) => {
          if (String(readerId) === String(userId)) {
            set((state) => ({
              messages: state.messages.map((msg) => ({ ...msg, isRead: true, status: "read" })),
            }));
          }
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket?.off("newMessage");
        socket?.off("typing");
        socket?.off("stopTyping");
        socket?.off("messagesRead");
      },

      initGlobalListener: () => {
         const socket = useAuthStore.getState().socket;
         if (!socket) return;
         
         socket.off("newMessage", get()._handleGlobalNewMessage);
         socket.on("newMessage", get()._handleGlobalNewMessage);

         socket.off("connect", get()._handleSocketConnect);
         socket.on("connect", get()._handleSocketConnect);
      },

      _handleSocketConnect: () => {
         get().getConversations();
         const activeId = get().activeConversationId;
         if (activeId) {
           get().getMessages(activeId);
         }
      },

      _handleGlobalNewMessage: (newMessage) => {
         get().getConversations();
      },

      cleanupGlobalListener: () => {
         const socket = useAuthStore.getState().socket;
         if (socket) {
           socket.off("newMessage", get()._handleGlobalNewMessage);
           socket.off("connect", get()._handleSocketConnect);
         }
      },

      setSelectedUser: (selectedUser) => set({ selectedUser }),

      setActiveConversationId: (activeConversationId) => {
        set((state) => ({
          activeConversationId,
          selectedUser:
            state.users.find((user) => user._id === activeConversationId) ||
            state.conversations.find((user) => user._id === activeConversationId) ||
            null,
          messages: activeConversationId ? state.messages : [],
        }));
      },

      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSidebarTab: (sidebarTab) => set({ sidebarTab }),
      setComposerText: (composerText) => set({ composerText }),
      setSoundEnabled: (isSoundEnabled) => set({ isSoundEnabled }),

      sendTextMessage: async (conversationId) => {
        const messageText = get().composerText.trim();
        if (!conversationId || !messageText) return false;

        const myId = useAuthStore.getState().user?._id;
        const clientId = `tmp_${Date.now()}_${Math.random()}`;
        const optimisticMsg = {
          _id: clientId,
          clientId,
          senderId: myId,
          receiverId: conversationId,
          text: messageText,
          status: "sending",
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, optimisticMsg],
          composerText: "",
        }));

        return get().sendMessage({ text: messageText, clientId }, clientId);
      },

      sendMediaMessage: async ({ conversationId, file }) => {
        if (!conversationId || !file) return false;

        const clientId = `tmp_${Date.now()}_${Math.random()}`;
        const formData = new FormData();
        formData.append("media", file);
        formData.append("clientId", clientId);

        const myId = useAuthStore.getState().user?._id;
        // Basic optimistic UI for media - only text is "Sending media...", since we don't have the URL yet.
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        
        let optimisticMsg = {
          _id: clientId,
          clientId,
          senderId: myId,
          receiverId: conversationId,
          status: "sending",
          createdAt: new Date().toISOString(),
        };

        // If it's an image, we can try to create a local preview blob
        if (isImage) {
           optimisticMsg.imageUrl = URL.createObjectURL(file);
        } else {
           optimisticMsg.fileName = file.name;
           optimisticMsg.fileSize = file.size;
        }

        set((state) => ({
          messages: [...state.messages, optimisticMsg],
        }));

        set({ isSendingMedia: true, uploadProgress: 0 });
        try {
          return await get().sendMessage(formData, clientId);
        } finally {
          set({ isSendingMedia: false });
        }
      },
    }),
    {
      name: "CHConnect-storage",
      partialize: (state) => ({ isSoundEnabled: state.isSoundEnabled }),
    },
  ),
);