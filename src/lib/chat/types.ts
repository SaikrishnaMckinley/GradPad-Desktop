export type ChatConversationType = "user" | "group";

export type ChatGroupPerson = {
  id: string;
  name: string;
  email?: string;
  photo?: string | null;
};

export type ChatConversation = {
  id: string;
  name: string;
  email?: string;
  type: ChatConversationType;
  image?: string | null;
  lastMessage: string | null;
  lastAt: string;
  unreadCount: number;
  isBlocked?: boolean;
  blockedByMe?: boolean;
  userHasLeft?: boolean;
  memberStatus?: string | null;
  members?: ChatGroupPerson[];
  admins?: ChatGroupPerson[];
  createdById?: string | null;
  description?: string | null;
};

export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string;
  messageType: "private" | "group";
  senderId: string;
  senderName: string;
  senderPhoto?: string | null;
  isDeleted: boolean;
  isEdited: boolean;
  media: { id: string; file: string; mediaType: string }[];
};

export type ChatThreadPayload = {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
};

export type ChatMemberOption = {
  id: string;
  name: string;
  email?: string;
  photo?: string | null;
};
