import { Id } from "@/convex/_generated/dataModel";

export type UserType = {
	_id: Id<"users">;
	_creationTime: number;
	email: string;
	username: string;
	imageUrl: string;
	clerkId: string;
};

export type MessageType = {
	sender: UserType | null;
	self: boolean;
	_id: Id<"messages">;
	_creationTime: number;
	content?: string | undefined;
	attachmentUrl?: string | undefined;
	editedAt?: number | undefined;
	type: "audio" | "video" | "image" | "text" | "file" | "system";
	createdAt: number;
	chatId: Id<"chats">;
	senderId: Id<"users">;
	deleted: boolean;
};

export type MemberType = {
	_id: Id<"chatMembers">;
	_creationTime: number;
	lastSeenMessageId?: Id<"messages"> | undefined;
	userId: Id<"users">;
	chatId: Id<"chats">;
	role: "admin" | "member";
	joinedAt: number;
};

export type ChatItemType = {
	_id: Id<"chats">;
	name: string | undefined;
	image: string | null;
	isGroup: boolean;
	friendId: Id<"users"> | null;
	lastMessage: MessageType | null;
	updatedAt: number;
};

export type ChatType = {
	members: MemberType[];
	displayName: string | undefined;
	displayImage: string | null;
	friend: UserType;
	isFriend: boolean;

	_id: Id<"chats">;
	_creationTime: number;
	name?: string | undefined;
	lastMessageId?: Id<"messages"> | undefined;
	lastActiveAt?: number | undefined;
	isGroup: boolean;
	createdBy: Id<"users">;
};
