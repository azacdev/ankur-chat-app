import React, { useState, useEffect, useRef } from "react";
import { useAppSelector, useAppDispatch } from "../hooks/use-redux";
import { addMessage, setMessages, addUser } from "../store/chat-slice";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { broadcastMessage } from "@/lib/utils";

const PAGE_SIZE = 25;

export default function Chat() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [isJoined, setIsJoined] = useState(false);
  const messages = useAppSelector((state) => state.chat.messages);
  const dispatch = useAppDispatch();
  const chatRef = useRef<HTMLDivElement>(null);
  const isFirstJoin = useRef(true);

  useEffect(() => {
    const storedMessages = JSON.parse(
      localStorage.getItem("chatMessages") || "[]"
    );
    dispatch(setMessages(storedMessages));

    const tabId = localStorage.getItem("tabId") || `tab-${Date.now()}`;
    localStorage.setItem("tabId", tabId);

    const storedUsername = localStorage.getItem(`username-${tabId}`);
    if (storedUsername) {
      setUsername(storedUsername);
      setIsJoined(true);
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "chatMessages" && e.newValue) {
        dispatch(setMessages(JSON.parse(e.newValue)));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      const tabId = localStorage.getItem("tabId") || `tab-${Date.now()}`;
      localStorage.setItem(`username-${tabId}`, username);
      dispatch(addUser(username));
      broadcastMessage({ type: "NEW_USER", payload: username });
      setIsJoined(true);

      if (isFirstJoin.current) {
        isFirstJoin.current = false;
        // Sync messages with other tabs
        broadcastMessage({ type: "SYNC_MESSAGES", payload: messages });
      }
    }
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && username) {
      const newMessage = {
        id: Date.now().toString(),
        user: username,
        text: message.trim(),
        timestamp: Date.now(),
      };
      dispatch(addMessage(newMessage));
      broadcastMessage({ type: "NEW_MESSAGE", payload: newMessage });
      setMessage("");
    }
  };

  const handleScroll = () => {
    if (chatRef.current && chatRef.current.scrollTop === 0) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const displayedMessages = messages.slice(-page * PAGE_SIZE);

  if (!isJoined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[350px] mx-auto mt-10 pb-10">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome back</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleUsernameSubmit}
              className="flex space-y-3 flex-col"
            >
              <label>Enter your name</label>
              <div className="flex flex-row gap-3">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your name"
                />
                <Button type="submit">Join</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="max-w-[550px] mx-auto mt-10">
      <CardHeader>
        <CardTitle>Chat Room</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={chatRef}
          onScroll={handleScroll}
          className="h-[400px] overflow-y-auto mb-4 flex flex-col"
        >
          {displayedMessages.length < 1 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-xl">Send a message to start a conversation</p>
            </div>
          ) : (
            displayedMessages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 ${
                  msg.user === username
                    ? "self-end bg-primary text-primary-foreground"
                    : "self-start bg-secondary"
                } rounded-lg px-3 py-2 max-w-[70%]`}
              >
                <div className="font-semibold">{msg.user}</div>
                <div>{msg.text}</div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleMessageSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />
          <Button type="submit">Send</Button>
        </form>
      </CardContent>
    </Card>
  );
}
