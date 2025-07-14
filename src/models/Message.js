import { v4 as uuidv4 } from 'uuid';

function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = uuidv4();
    localStorage.setItem('deviceId', id);
  }
  return id;
}

class Message {
  constructor({
    messageId = uuidv4(),
    chatId,
    sentBy,
    text,
    createdAt = new Date().toISOString(),
    strand = false,
    parentMessageId = null,
    chatTitle = null,
    userId = getDeviceId(),
  }) {
    this.messageId = messageId;
    this.chatId = chatId;
    this.sentBy = sentBy;
    this.text = text;
    this.createdAt = createdAt;
    this.strand = strand;
    this.parentMessageId = parentMessageId;
    this.chatTitle = chatTitle || chatId;
    this.userId = userId;
  }

  toApiFormat() {
    return {
      role: this.sentBy === 0 ? "user" : "assistant",
      parts: [{ text: this.text }],
      userId: this.userId,
    };
  }

  static fromApiResponse(chatId, response, strand = false, parentMessageId = null, chatTitle = null) {
    return new Message({
      chatId,
      sentBy: 1,
      text: response.candidates?.[0]?.content?.parts?.[0]?.text || "No response from AI.",
      strand,
      parentMessageId,
      chatTitle,
    });
  }

  static createUserMessage(chatId, text, strand = false, parentMessageId = null, chatTitle = null) {
    return new Message({
      chatId,
      sentBy: 0,
      text,
      strand,
      parentMessageId,
      chatTitle,
    });
  }

  static createErrorMessage(chatId, strand = false, parentMessageId = null, chatTitle = null) {
    return new Message({
      chatId,
      sentBy: 1,
      text: "Sorry, I couldn't process your message at the moment.",
      strand,
      parentMessageId,
      chatTitle
    });
  }
}

export default Message;