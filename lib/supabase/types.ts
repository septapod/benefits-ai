export interface Profile {
  id: string;
  email: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ConversationWithMessages extends Conversation {
  messages: DbMessage[];
}

export interface UserWithConversations extends Profile {
  conversations: Conversation[];
}
