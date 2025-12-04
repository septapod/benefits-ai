'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Conversation, DbMessage } from '@/lib/supabase/types';
import Link from 'next/link';

interface UserWithStats extends Profile {
  conversation_count: number;
  message_count: number;
}

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userConversations, setUserConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DbMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    setIsAdmin(profile?.is_admin ?? false);
    setLoading(false);

    if (profile?.is_admin) {
      loadUsers();
    }
  };

  const loadUsers = async () => {
    // Get all profiles with conversation and message counts
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!profiles) return;

    // Get conversation counts for each user
    const usersWithStats: UserWithStats[] = await Promise.all(
      profiles.map(async (profile) => {
        const { count: convCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const { count: msgCount } = await supabase
          .from('messages')
          .select('*, conversations!inner(user_id)', { count: 'exact', head: true })
          .eq('conversations.user_id', profile.id);

        return {
          ...profile,
          conversation_count: convCount ?? 0,
          message_count: msgCount ?? 0,
        };
      })
    );

    setUsers(usersWithStats);
  };

  const loadUserConversations = async (userId: string) => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    setUserConversations(data || []);
  };

  const loadConversationMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const toggleUserAdmin = async (userId: string, currentStatus: boolean) => {
    await supabase
      .from('profiles')
      .update({ is_admin: !currentStatus })
      .eq('id', userId);

    loadUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user and all their data?')) {
      return;
    }

    // Delete profile (cascades to conversations and messages via FK)
    await supabase.from('profiles').delete().eq('id', userId);

    // Note: To fully delete user from auth.users, you'd need a server-side function
    // or use the Supabase dashboard

    setSelectedUser(null);
    setUserConversations([]);
    loadUsers();
  };

  const deleteConversation = async (conversationId: string) => {
    if (!confirm('Delete this conversation?')) return;

    await supabase.from('conversations').delete().eq('id', conversationId);

    setSelectedConversation(null);
    setMessages([]);
    if (selectedUser) {
      loadUserConversations(selectedUser.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have admin privileges.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Back to BenefitsAI
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white font-semibold">A</span>
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">Manage users and conversations</p>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            Back to app
          </Link>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Users List */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="font-medium text-gray-900">Users ({users.length})</h2>
          </div>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setSelectedConversation(null);
                    setMessages([]);
                    loadUserConversations(user.id);
                  }}
                  className={`w-full text-left p-4 border-b hover:bg-gray-50 ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{user.email || 'No email'}</span>
                    {user.is_admin && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {user.conversation_count} conversations, {user.message_count} messages
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Joined {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User Details / Conversations */}
        <div className="w-80 border-r bg-white overflow-y-auto">
          {selectedUser ? (
            <>
              <div className="p-4 border-b">
                <h2 className="font-medium text-gray-900 truncate">{selectedUser.email}</h2>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleUserAdmin(selectedUser.id, selectedUser.is_admin)}
                    className={`text-xs px-3 py-1.5 rounded ${
                      selectedUser.is_admin
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {selectedUser.is_admin ? 'Remove Admin' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => deleteUser(selectedUser.id)}
                    className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    Delete User
                  </button>
                </div>
              </div>
              <div className="p-4 border-b">
                <h3 className="text-sm font-medium text-gray-700">
                  Conversations ({userConversations.length})
                </h3>
              </div>
              <ul>
                {userConversations.map((conv) => (
                  <li key={conv.id}>
                    <button
                      onClick={() => {
                        setSelectedConversation(conv);
                        loadConversationMessages(conv.id);
                      }}
                      className={`w-full text-left p-3 border-b hover:bg-gray-50 ${
                        selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className="text-sm font-medium truncate">{conv.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(conv.updated_at).toLocaleString()}
                      </p>
                    </button>
                  </li>
                ))}
                {userConversations.length === 0 && (
                  <li className="p-4 text-sm text-gray-500 text-center">
                    No conversations
                  </li>
                )}
              </ul>
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              Select a user to view details
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 bg-white overflow-y-auto">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h2 className="font-medium text-gray-900">{selectedConversation.title}</h2>
                  <p className="text-xs text-gray-500">
                    {messages.length} messages
                  </p>
                </div>
                <button
                  onClick={() => deleteConversation(selectedConversation.id)}
                  className="text-xs px-3 py-1.5 rounded bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Delete Conversation
                </button>
              </div>
              <div className="p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
