import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Message from "../../models/Message";
import { useCallback } from 'react';
import "./ChatPage.css";
import { sendMessageToGemini } from "../../api/gemini";
import { useRef } from 'react';

const MAX_CONTEXT_SIZE_MAIN_CHAT = parseInt(localStorage.getItem('mainChatQueueSize')) || 10;
const MAX_CONTEXT_SIZE_THREAD_CHAT = parseInt(localStorage.getItem('threadChatQueueSize')) || 5;

function ChatPage() {
  const { chatId } = useParams();
  const shortId = chatId.slice(-5);

  const [chatTitle, setChatTitle] = useState(shortId);
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [contextQueue, setContextQueue] = useState([]);
  const [threadContextQueue, setThreadContextQueue] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [threadWidth, setThreadWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [messageStore, setMessageStore] = useState([]);

  const textareaRef = useRef(null);
  const threadTextareaRef = useRef(null);

  const fetchChatMessages = async (chatId) => {
    try {
      const res = await fetch(`https://api.strandschat.com/api/get-chat/${chatId}`);
      const data = await res.json();
      if (res.ok) {
        return data.messages;
      } else {
        console.error("Failed to fetch messages:", data.error);
        return [];
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      return [];
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const fetched = await fetchChatMessages(chatId);
      const parsedMessages = fetched.map(msg => new Message(msg));
      const mainMessages = parsedMessages.filter(msg => !msg.strand);
      setMessages(mainMessages);
      setMessageStore(parsedMessages);

      if (parsedMessages.length > 0) {
      setChatTitle(parsedMessages[0].chatTitle);
      }

      const lastTenMain = mainMessages.slice(-10);
      setContextQueue(lastTenMain);
    };

    loadMessages();
  }, [chatId]);

  const resizeMainTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  const resizeThreadTextarea = () => {
    const el = threadTextareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  };

  useEffect(() => {
    resizeMainTextarea();
  }, [userInput]);

  useEffect(() => {
    resizeThreadTextarea();
  }, [activeThread?.input]);

  const updateContextQueue = (newMessage) => {
    setContextQueue(prevQueue => {
      const updatedQueue = [...prevQueue, newMessage];
      if (updatedQueue.length > MAX_CONTEXT_SIZE_MAIN_CHAT) {
        return updatedQueue.slice(1);
      }
      return updatedQueue;
    });
  };

  const updateThreadContextQueue = (newMessage) => {
    setThreadContextQueue(prevQueue => {
      const updatedQueue = [...prevQueue, newMessage];
      if (updatedQueue.length > MAX_CONTEXT_SIZE_THREAD_CHAT) {
        return updatedQueue.slice(1);
      }
      return updatedQueue;
    });
  };

  const handleResizeStart = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  const handleResizeMove = useCallback((e) => {
    if (!isResizing) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 300 && newWidth <= 800) {
      setThreadWidth(newWidth);
      document.documentElement.style.setProperty('--thread-width', `${newWidth}px`);
    }
  }, [isResizing]);

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMove);
      window.addEventListener('mouseup', handleResizeEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleResizeMove);
      window.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove]);

  useEffect(() => {
    document.documentElement.style.setProperty('--thread-width', `${threadWidth}px`);
  }, [threadWidth]);

  const truncateText = (text, maxSentences = 2) => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    if (sentences.length <= maxSentences) return text;
    return sentences.slice(0, maxSentences).join(' ') + '...';
  };

  const handleSend = async () => {
    if (userInput.trim() === "") return;

    const userMessage = Message.createUserMessage(chatId, userInput, false, null, chatTitle);

    setMessages((prev) => [...prev, userMessage]);
    setMessageStore((prev) => [...prev, userMessage]);
    updateContextQueue(userMessage);
    setUserInput("");
    setIsLoading(true);

    try {
      const conversationContext = contextQueue.map(msg => msg.toApiFormat());
      conversationContext.push(userMessage.toApiFormat());

      const data = await sendMessageToGemini(conversationContext);
      const assistantMessage = Message.fromApiResponse(chatId, data, false, null, chatTitle);

      setMessages((prev) => [...prev, assistantMessage]);
      setMessageStore((prev) => [...prev, assistantMessage]);
      updateContextQueue(assistantMessage);

      const updatedQueue = [...contextQueue, userMessage, assistantMessage];
      const hasUserMessage = updatedQueue.some(msg => msg.sentBy === 0);
      const hasLLMResponse = updatedQueue.some(msg => msg.sentBy === 1);
      const totalMessages = updatedQueue.length;

      if (hasUserMessage && hasLLMResponse && totalMessages === 2) {
        try {
          const namePrompt = {
            role: "user",
            parts: [{ text: "Based on this conversation, generate a short, descriptive title (max 5 words) for this chat. Only respond with the title, nothing else." }]
          };

          const nameData = await sendMessageToGemini([...updatedQueue.map(msg => msg.toApiFormat()), namePrompt]);

          if (nameData.candidates && nameData.candidates[0]?.content?.parts?.[0]?.text) {
            const newTitle = nameData.candidates[0].content.parts[0].text.trim();
            setChatTitle(newTitle);
            setMessages(prev =>
              prev.map(msg =>
                msg.chatId === chatId && msg.chatTitle === shortId
                  ? { ...msg, chatTitle: newTitle }
                  : msg
              )
            );

            setMessageStore(prev =>
              prev.map(msg =>
                msg.chatId === chatId && msg.chatTitle === shortId
                  ? { ...msg, chatTitle: newTitle }
                  : msg
              )
            );
          } else {
            console.warn("Title generation response did not contain expected data structure:", nameData);
          }
        } catch (titleError) {
          console.error("Error generating chat title:", titleError);
        }
      } else {
        console.error("Skipping title generation - need exactly one user message and one LLM response");
      }
    } catch (error) {
      console.error("Error fetching from LLM:", error);
      const errorMessage = Message.createErrorMessage(chatId, false, null, chatTitle);

      setMessages((prev) => [...prev, errorMessage]);
      setMessageStore((prev) => [...prev, errorMessage]);
      updateContextQueue(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleThreadSend = async () => {
    if (activeThread.input.trim() === "") return;

    const userReply = Message.createUserMessage(
      chatId,
      activeThread.input,
      true,
      activeThread.parent.id,
      chatTitle
    )

    setActiveThread((prev) => ({
      ...prev,
      replies: [...prev.replies, userReply],
      input: "",
    }));

    updateThreadContextQueue(userReply);
    setMessageStore((prev) => [...prev, userReply]);
    setIsThreadLoading(true);

    try {
      const threadContext = threadContextQueue.map(msg =>
        msg.toApiFormat ? msg.toApiFormat() : new Message(msg).toApiFormat()
      );
      threadContext.push(userReply.toApiFormat());

      const data = await sendMessageToGemini(threadContext);
      const assistantReply = Message.fromApiResponse(chatId, data, true, activeThread.parent.id, chatTitle);

      setActiveThread((prev) => ({
        ...prev,
        replies: [...prev.replies, assistantReply],
      }));
      setMessageStore((prev) => [...prev, assistantReply]);
      updateThreadContextQueue(assistantReply);
    } catch (error) {
      console.error("Error fetching from LLM in thread:", error);
      const errorReply = Message.createErrorMessage(
        chatId,
        true,
        activeThread.parent.id,
        chatTitle
      );

      setActiveThread((prev) => ({
        ...prev,
        replies: [...prev.replies, errorReply],
      }));

      updateThreadContextQueue(errorReply);
    } finally {
      setIsThreadLoading(false);
    }
  };

  const startThread = (parentMessage) => {
    const threadReplies = messageStore
      .filter((msg) => msg.parentChatId === parentMessage.id)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    const recentReplies = threadReplies.slice(-MAX_CONTEXT_SIZE_THREAD_CHAT + 1);
    const newThreadContextQueue = [parentMessage, ...recentReplies];
    setThreadContextQueue(newThreadContextQueue);
    setActiveThread({
      parent: parentMessage,
      replies: threadReplies,
      input: "",
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleThreadKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleThreadSend();
    }
  };

  const saveMessagesToSupabase = async (allMessages) => {
    try {
      const res = await fetch('https://api.strandschat.com/api/save-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: allMessages })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Messages saved:', data.message);
        return true;
      } else {
        console.error('❌ Save failed:', data.error);
        return false;
      }
    } catch (err) {
      console.error('❌ Network/server error:', err);
      return false;
    }
  };

  return (
    <div className={`chat-container ${activeThread ? "drawer-open" : ""}`}>
      <div className="main-chat">
        <div className="chat-header">
          <div className="chat-title-row">
            <h1 className="chat-title">
              {chatTitle} <span className="chat-id">#{shortId}</span>
            </h1>
            <a className="save-chat-button"
            onClick = {async () => {
              const success = await saveMessagesToSupabase(messageStore);
              if (success) {
                setMessageStore([]);
                alert("Chat saved successfully");
                window.location.reload();
              } else {
                alert("Failed to save chat");
              }
            }}
            >Save Chat</a>
          </div>
        </div>

        <div className="chat-body">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-placeholder">
                Your conversation starts here 🚀
              </p>
            ) : (
              <>
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${msg.sentBy === 0 ? "user" : "assistant"
                      }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>

                    {/* Strand Off Button */}
                    {msg.sentBy === 1 && (
                      <div className="strand-off">
                        <button
                          className="strand-button"
                          onClick={() => startThread(msg)}
                        >
                          🧵 Start a strand
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="loading-bubble">
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="chat-input-area">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
                resizeMainTextarea();
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {userInput.trim() !== "" && (
              <button
                className="send-icon-button"
                onClick={handleSend}
                disabled={isLoading}
              >
                <span className="arrow-icon">↑</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {activeThread && (
        <>
          <div
            className="resize-handle"
            onMouseDown={handleResizeStart}
          />
          <div className="thread-panel" style={{ width: `${threadWidth}px` }}>
            <div className="thread-header">
              <button
                className="close-thread"
                onClick={() => setActiveThread(null)}
              >
                ✖️
              </button>
              <h2>Strand 🧵</h2>
            </div>

            <div className="thread-replies">
              <div className="thread-bubble assistant">
                <ReactMarkdown>{truncateText(activeThread.parent.text, 1)}</ReactMarkdown>
                <div className="parent-message-more">
                  <span className="message-count">
                    {activeThread.parent.text.split(/(?<=[.!?])\s+/).length} sentences
                  </span>
                </div>
              </div>
              {activeThread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`thread-bubble ${reply.sentBy === 0 ? 'user' : 'assistant'}`}
                >
                  <ReactMarkdown>{reply.text}</ReactMarkdown>
                </div>
              ))}
              {isThreadLoading && (
                <div className="loading-bubble">
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="chat-input-area">
              <textarea
                ref={threadTextareaRef}
                className="chat-textarea"
                placeholder="Reply in thread..."
                value={activeThread.input}
                onChange={(e) => {
                  setActiveThread((prev) => ({ ...prev, input: e.target.value }));
                  resizeThreadTextarea();
                }}
                onKeyDown={handleThreadKeyDown}
                disabled={isThreadLoading}
              />
              {activeThread.input.trim() !== "" && (
                <button
                  className="send-icon-button"
                  onClick={handleThreadSend}
                  disabled={isThreadLoading}
                >
                  <span className="arrow-icon">↑</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;