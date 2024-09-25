import { broadcastMessage } from "@/lib/utils";
import { store } from "../../store/store"; 
import { addMessage, addUser, setMessages } from "@/store/chat-slice";

jest.mock("../../store/store", () => ({
  store: {
    dispatch: jest.fn(),
  },
}));

describe("Utils", () => {
  let mockPostMessage: jest.Mock;
  let mockAddEventListener: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPostMessage = jest.fn();
    mockAddEventListener = jest.fn();
    global.BroadcastChannel = jest.fn().mockImplementation(() => ({
      postMessage: mockPostMessage,
      addEventListener: mockAddEventListener,
    }));
  });

  test("broadcastMessage should post message to BroadcastChannel", () => {
    const message = {
      type: "NEW_MESSAGE",
      payload: {
        id: "1",
        user: "TestUser",
        text: "Hello",
        timestamp: Date.now(),
      },
    };
    broadcastMessage(message);
    expect(mockPostMessage).toHaveBeenCalledWith(message);
  });

  test("BroadcastChannel onmessage should handle NEW_MESSAGE", () => {
    const message = {
      type: "NEW_MESSAGE",
      payload: {
        id: "1",
        user: "TestUser",
        text: "Hello",
        timestamp: Date.now(),
      },
    };
    const onMessageHandler = mockAddEventListener.mock.calls[0][1];
    onMessageHandler({ data: message });
    expect(store.dispatch).toHaveBeenCalledWith(addMessage(message.payload));
  });

  test("BroadcastChannel onmessage should handle NEW_USER", () => {
    const message = { type: "NEW_USER", payload: "TestUser" };
    const onMessageHandler = mockAddEventListener.mock.calls[0][1];
    onMessageHandler({ data: message });
    expect(store.dispatch).toHaveBeenCalledWith(addUser(message.payload));
  });

  test("BroadcastChannel onmessage should handle SYNC_MESSAGES", () => {
    const message = {
      type: "SYNC_MESSAGES",
      payload: [
        { id: "1", user: "TestUser", text: "Hello", timestamp: Date.now() },
      ],
    };
    const onMessageHandler = mockAddEventListener.mock.calls[0][1];
    onMessageHandler({ data: message });
    expect(store.dispatch).toHaveBeenCalledWith(setMessages(message.payload));
  });
});
