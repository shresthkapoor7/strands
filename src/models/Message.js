class Message {
  constructor(shortId, chatId, sentBy, text, createdAt = Date.now(), strand = false, parentChatId = -1, chatTitle = null) {
    this.shortId = shortId;        // Which chat we are in
    this.chatId = chatId;          // ID for the message (starts from 0)
    this.sentBy = sentBy;          // 0 for user, 1 for gemini
    this.text = text;              // The message content
    this.createdAt = createdAt;    // Timestamp
    this.strand = strand;          // True if in thread, false if normal message
    this.parentChatId = parentChatId; // Parent's chatId if in thread, -1 otherwise
    this.chatTitle = chatTitle || shortId; // Chat title, defaults to shortId
  }

  // Convert to API format
  toApiFormat() {
    return {
      role: this.sentBy === 0 ? "user" : "assistant",
      parts: [{ text: this.text }]
    };
  }

  // Create from API response
  static fromApiResponse(shortId, chatId, response, strand = false, parentChatId = -1, chatTitle = null) {
    return new Message(
      shortId,
      chatId,
      1, // Gemini
      response.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.",
      Date.now(),
      strand,
      parentChatId,
      chatTitle
    );
  }

  // Create user message
  static createUserMessage(shortId, chatId, text, strand = false, parentChatId = -1, chatTitle = null) {
    return new Message(
      shortId,
      chatId,
      0, // User
      text,
      Date.now(),
      strand,
      parentChatId,
      chatTitle
    );
  }

  // Create error message
  static createErrorMessage(shortId, chatId, strand = false, parentChatId = -1, chatTitle = null) {
    return new Message(
      shortId,
      chatId,
      1, // Gemini
      "Sorry, I couldn't process your message at the moment.",
      Date.now(),
      strand,
      parentChatId,
      chatTitle
    );
  }
}

export default Message;