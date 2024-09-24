import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { store } from "../store/store";
import { addMessage, addUser, setMessages } from "../store/chat-slice";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const chatChannel = new BroadcastChannel("chat_channel");

export const broadcastMessage = (message: any) => {
  chatChannel.postMessage(message);

  if (message.type === "NEW_MESSAGE") {
    const currentMessages = JSON.parse(
      localStorage.getItem("chatMessages") || "[]"
    );
    currentMessages.push(message.payload);
    localStorage.setItem("chatMessages", JSON.stringify(currentMessages));
  }
};

chatChannel.onmessage = (event) => {
  const { type, payload } = event.data;
  switch (type) {
    case "NEW_MESSAGE":
      store.dispatch(addMessage(payload));
      break;
    case "NEW_USER":
      store.dispatch(addUser(payload));
      break;
    case "SYNC_MESSAGES":
      store.dispatch(setMessages(payload));
      break;
    default:
      break;
  }
};

window.addEventListener("storage", (e) => {
  if (e.key === "chatMessages" && e.newValue) {
    const messages = JSON.parse(e.newValue);
    store.dispatch(setMessages(messages));
  }
});
