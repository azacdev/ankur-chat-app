import chatReducer, { addMessage, setMessages, addUser } from "@/store/chat-slice";

describe("Chat Slice", () => {
  const initialState = {
    messages: [],
    users: [],
  };

  test("should handle addMessage", () => {
    const message = {
      id: "1",
      user: "TestUser",
      text: "Hello",
      timestamp: Date.now(),
    };
    const nextState = chatReducer(initialState, addMessage(message));
    expect(nextState.messages).toEqual([message]);
  });

  test("should handle setMessages", () => {
    const messages = [
      { id: "1", user: "TestUser", text: "Hello", timestamp: Date.now() },
      { id: "2", user: "OtherUser", text: "Hi", timestamp: Date.now() },
    ];
    const nextState = chatReducer(initialState, setMessages(messages));
    expect(nextState.messages).toEqual(messages);
  });

  test("should handle addUser", () => {
    const nextState = chatReducer(initialState, addUser("TestUser"));
    expect(nextState.users).toEqual(["TestUser"]);
  });

  test("should not add duplicate users", () => {
    let state = chatReducer(initialState, addUser("TestUser"));
    state = chatReducer(state, addUser("TestUser"));
    expect(state.users).toEqual(["TestUser"]);
  });
});
