import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Loader2, MessageSquare, Send } from "lucide-react";
import api from "../config/api";
import { extractList, getId } from "../utils/backendAdapters";

const MessagingPage = () => {
  const { user } = useSelector((state) => state.isAuth);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/messaging/conversations/");
      const list = extractList(res.data, ["conversations", "results"]);
      setConversations(list);
      if (!activeConversation && list.length) {
        setActiveConversation(list[0]);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [activeConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation?.id) {
        return;
      }

      try {
        const res = await api.get(`/messaging/conversations/${activeConversation.id}/messages/`);
        setMessages(extractList(res.data, ["messages", "results"]));
        await api.patch(`/messaging/conversations/${activeConversation.id}/read/`);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load messages");
      }
    };

    fetchMessages();
  }, [activeConversation]);

  const getConversationName = (conversation) => {
    const participants = conversation.participants_info || [];
    const other = participants.find((participant) => String(getId(participant)) !== String(user?.id)) || participants[0];
    return other?.full_name || other?.email || `Conversation #${conversation.id}`;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !activeConversation?.id) {
      return;
    }

    setIsSending(true);
    try {
      const res = await api.post(`/messaging/conversations/${activeConversation.id}/messages/`, {
        content: content.trim(),
      });
      setMessages((prev) => [...prev, res.data]);
      setContent("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-6">Messages</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] bg-card border border-border rounded-2xl overflow-hidden min-h-[620px]">
        <aside className="border-b lg:border-b-0 lg:border-r border-border">
          <div className="p-4 border-b border-border font-black">Conversations</div>
          {isLoading ? (
            <div className="p-6 text-muted-foreground flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading...
            </div>
          ) : conversations.length ? (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setActiveConversation(conversation)}
                className={`w-full text-left px-4 py-4 border-b border-border hover:bg-muted/40 ${
                  activeConversation?.id === conversation.id ? "bg-primary/10" : ""
                }`}
              >
                <p className="font-bold">{getConversationName(conversation)}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {conversation.last_message?.content || "No messages yet"}
                </p>
              </button>
            ))
          ) : (
            <div className="p-6 text-muted-foreground text-sm">No conversations yet. Start one from a user profile.</div>
          )}
        </aside>

        <section className="flex flex-col">
          {activeConversation ? (
            <>
              <div className="p-4 border-b border-border font-black">{getConversationName(activeConversation)}</div>
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-background/40">
                {messages.map((message) => {
                  const mine = String(message.sender) === String(user?.id);
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2 rounded-2xl ${mine ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
                        <p className="text-sm leading-6">{message.content}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-3">
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary"
                />
                <button disabled={isSending} className="bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold">
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3" />
              Choose a conversation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MessagingPage;
