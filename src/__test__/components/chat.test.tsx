//@ts-nocheck
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import chatReducer, { ChatState } from "@/store/chat-slice";
import Chat from "@/components/chat";
import * as utils from "../../lib/utils";

// Mock the BroadcastChannel
class MockBroadcastChannel {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
  postMessage(message: any) {}
  addEventListener(type: string, callback: (event: any) => void) {}
  removeEventListener(type: string, callback: (event: any) => void) {}
  close() {}
}

global.BroadcastChannel = MockBroadcastChannel as any;

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string): string | null => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock broadcastMessage
jest.spyOn(utils, "broadcastMessage").mockImplementation(() => {});

interface RootState {
  chat: ChatState;
}

const createMockStore = (
  initialState: Partial<RootState> = {}
): EnhancedStore<RootState> => {
  return configureStore({
    reducer: {
      chat: chatReducer,
    },
    preloadedState: initialState as RootState,
  });
};

describe("Chat Component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("renders username input when not joined", () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
  });

  test("allows user to join chat", async () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );
    const input = screen.getByPlaceholderText("Your name");
    const joinButton = screen.getByText("Join");

    await userEvent.type(input, "TestUser");
    await userEvent.click(joinButton);

    expect(screen.getByText("Chat Room")).toBeInTheDocument();
  });

  test("displays empty state message when no messages", () => {
    const store = createMockStore({
      chat: { messages: [], users: ["TestUser"] },
    });
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );
    expect(
      screen.getByText("Send a message to start a conversation")
    ).toBeInTheDocument();
  });

  test("allows user to send a message", async () => {
    const store = createMockStore({
      chat: { messages: [], users: ["TestUser"] },
    });
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );
    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    await userEvent.type(input, "Hello, World!");
    await userEvent.click(sendButton);

    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
  });

  test("loads messages from localStorage on mount", () => {
    const messages = [
      {
        id: "1",
        user: "TestUser",
        text: "Test message",
        timestamp: Date.now(),
      },
    ];
    localStorage.setItem("chatMessages", JSON.stringify(messages));

    const store = createMockStore();
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );

    expect(screen.getByText("Test message")).toBeInTheDocument();
  });

  test("broadcasts new messages", async () => {
    const store = createMockStore({
      chat: { messages: [], users: ["TestUser"] },
    });
    render(
      <Provider store={store}>
        <Chat />
      </Provider>
    );
    const input = screen.getByPlaceholderText("Type a message...");
    const sendButton = screen.getByText("Send");

    await userEvent.type(input, "Hello, World!");
    await userEvent.click(sendButton);

    expect(utils.broadcastMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "NEW_MESSAGE",
        payload: expect.objectContaining({
          text: "Hello, World!",
        }),
      })
    );
  });
});
