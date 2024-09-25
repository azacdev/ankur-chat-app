import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  users: string[];
}

const initialState: ChatState = {
  messages: [],
  users: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addUser: (state, action: PayloadAction<string>) => {
      if (!state.users.includes(action.payload)) {
        state.users.push(action.payload);
      }
    },
  },
});

export const { addMessage, setMessages, addUser } = chatSlice.actions;
export default chatSlice.reducer;
