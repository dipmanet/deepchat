import { create } from "zustand";
import { ChatType } from "./types";

type UserState = {
	user: boolean;
	setUser: (show: boolean) => void;
};
type ShowDetailsState = {
	showDetails: boolean;
	setShowDetails: (show: boolean) => void;
};
type ChatState = {
	currentChat: ChatType | null;
	setCurrentChat: (currentChat: ChatType | null) => void;
};

export const useUserStore = create<UserState>((set) => ({
	user: false,
	setUser: (user) => set({ user }),
}));
export const useShowDetailsStore = create<ShowDetailsState>((set) => ({
	showDetails: false,
	setShowDetails: (show) => set({ showDetails: show }),
}));

export const useChatStore = create<ChatState>((set) => ({
	currentChat: null,
	setCurrentChat: (chat) => set({ currentChat: chat }),
}));

// export const useBoundStore =
// 	create < Class
// 	+
// 	0
// 	. >
// 	((...a) => ({
// 		...createShowDetails(...a),
// 		...createDetails(...a),
// 	}));
