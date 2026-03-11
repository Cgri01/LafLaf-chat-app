import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from './useAuthStore';
    
export const useChatStore = create((set , get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get('/messages/users');
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch users');

        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true,});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch messages');
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
       const {selectedUser , messages } = get()
       try {
        const res = await axiosInstance.post(`/messages/send/${selectedUser._id}` , messageData);
        set({ messages: [...messages , res.data]}) // ...messages ile mevcut mesajları korur ve yeni mesajı ekler. , res.data ile sunucudan dönen yeni mesajı ekler.
       } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to send message');
        console.error('Error sending message:', error);
       }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get()
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket; // useAuthStore'dan socket'ı alır. useAuthStore,
        //  kullanıcı kimlik doğrulamasıyla ilgili bilgileri ve işlemleri yönetir.

        socket.on("newMessage" , (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.SenderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
            set({
                messages : [...get().messages , newMessage] // get().messages ile mevcut mesajları alır ve ... ile açar, newMessage ile yeni mesajı ekler.
            });
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket; // useAuthStore'dan socket'ı alır. useAuthStore, 
        // kullanıcı kimlik doğrulamasıyla ilgili bilgileri ve işlemleri yönetir.
        socket.off("newMessage"); // "newMessage" olayını dinlemeyi bırakır. Bu, bileşen unmount olduğunda veya kullanıcı başka bir sohbet seçtiğinde gereklidir, böylece eski sohbetten gelen mesajlar yeni sohbetin mesajlarıyla karışmaz.
    },

    setSelectedUser : (selectedUser) => set({selectedUser}),

}))