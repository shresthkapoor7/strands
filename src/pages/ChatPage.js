import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { API_CONFIG } from "../config";
import Message from "../models/Message";
import "./ChatPage.css";

// Queue size constant
const MAX_CONTEXT_SIZE_MAIN_CHAT = 10;
const MAX_CONTEXT_SIZE_THREAD_CHAT = 5;

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
  const [messageCounter, setMessageCounter] = useState(0);

  // Function to update context queue
  const updateContextQueue = (newMessage) => {
    setContextQueue(prevQueue => {
      const updatedQueue = [...prevQueue, newMessage];
      if (updatedQueue.length > MAX_CONTEXT_SIZE_MAIN_CHAT) {
        return updatedQueue.slice(1);
      }
      return updatedQueue;
    });
  };

  // Function to update thread context queue
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

  const handleResizeMove = (e) => {
    if (!isResizing) return;

    // Calculate position relative to the window width
    const newWidth = window.innerWidth - e.clientX;

    // Apply constraints (min and max width)
    if (newWidth >= 300 && newWidth <= 800) {
      setThreadWidth(newWidth);

      // Update the CSS variable for thread width
      document.documentElement.style.setProperty('--thread-width', `${newWidth}px`);
    }
  };

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
  }, [isResizing]);

  // Update thread width CSS variable when threadWidth state changes
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

    const userMessage = Message.createUserMessage(shortId, messageCounter, userInput, false, -1, chatTitle);
    setMessageCounter(prev => prev + 1);

    setMessages((prev) => [...prev, userMessage]);
    updateContextQueue(userMessage);
    setUserInput("");
    setIsLoading(true);

    try {
      // Prepare context for API call
      const conversationContext = contextQueue.map(msg => msg.toApiFormat());
      conversationContext.push(userMessage.toApiFormat());

      const response = await fetch(
        `${API_CONFIG.GEMINI.BASE_URL}?key=${API_CONFIG.GEMINI.API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: conversationContext,
          }),
        }
      );

      const data = await response.json();
      const assistantMessage = Message.fromApiResponse(shortId, messageCounter, data, false, -1, chatTitle);
      setMessageCounter(prev => prev + 1);

      setMessages((prev) => [...prev, assistantMessage]);
      updateContextQueue(assistantMessage);
    } catch (error) {
      console.error("Error fetching from LLM:", error);
      const errorMessage = Message.createErrorMessage(shortId, messageCounter, false, -1, chatTitle);
      setMessageCounter(prev => prev + 1);

      setMessages((prev) => [...prev, errorMessage]);
      updateContextQueue(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Debug function to monitor context queue
  useEffect(() => {
    console.log("Current context queue:", contextQueue);
  }, [contextQueue]);

  const startThread = (parentMessage) => {
    setActiveThread({
      parent: parentMessage,
      replies: [],
      input: "",
    });
    // Initialize thread context with parent message
    setThreadContextQueue([parentMessage]);
  };

  const handleThreadSend = async () => {
    if (activeThread.input.trim() === "") return;

    const userReply = Message.createUserMessage(
      shortId,
      messageCounter,
      activeThread.input,
      true,
      activeThread.parent.chatId,
      chatTitle
    );
    setMessageCounter(prev => prev + 1);

    setActiveThread((prev) => ({
      ...prev,
      replies: [...prev.replies, userReply],
      input: "",
    }));

    updateThreadContextQueue(userReply);
    setIsThreadLoading(true);

    try {
      const threadContext = threadContextQueue.map(msg => msg.toApiFormat());
      threadContext.push(userReply.toApiFormat());

      const response = await fetch(
        `${API_CONFIG.GEMINI.BASE_URL}?key=${API_CONFIG.GEMINI.API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: threadContext,
          }),
        }
      );

      const data = await response.json();
      const assistantReply = Message.fromApiResponse(
        shortId,
        messageCounter,
        data,
        true,
        activeThread.parent.chatId,
        chatTitle
      );
      setMessageCounter(prev => prev + 1);

      setActiveThread((prev) => ({
        ...prev,
        replies: [...prev.replies, assistantReply],
      }));

      updateThreadContextQueue(assistantReply);
    } catch (error) {
      console.error("Error fetching from LLM in thread:", error);
      const errorReply = Message.createErrorMessage(
        shortId,
        messageCounter,
        true,
        activeThread.parent.chatId,
        chatTitle
      );
      setMessageCounter(prev => prev + 1);

      setActiveThread((prev) => ({
        ...prev,
        replies: [...prev.replies, errorReply],
      }));

      updateThreadContextQueue(errorReply);
    } finally {
      setIsThreadLoading(false);
    }
  };

  // Debug function to monitor both context queues
  useEffect(() => {
    console.log("Main context queue:", contextQueue);
    console.log("Thread context queue:", threadContextQueue);
  }, [contextQueue, threadContextQueue]);

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

  return (
    <div className={`chat-container ${activeThread ? "drawer-open" : ""}`}>
      <div className="main-chat">
        <div className="chat-header">
          <h1 className="chat-title">
            {chatTitle} <span className="chat-id">#{shortId}</span>
          </h1>
        </div>

        <div className="chat-body">
          <div className="chat-messages">
            {messages.length === 0 ? (
              <p className="chat-placeholder">
                Your conversation starts here 🚀
              </p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.chatId}
                    className={`chat-bubble ${
                      msg.sentBy === 0 ? "user" : "assistant"
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
              className="chat-textarea"
              placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Thread Sidebar */}
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
              <h2>Thread 🧵</h2>
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
                  key={reply.chatId}
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

            <div className="thread-input-area">
              <textarea
                className="thread-textarea"
                placeholder="Reply in thread... (Enter to send, Shift+Enter for new line)"
                value={activeThread.input}
                onChange={(e) =>
                  setActiveThread((prev) => ({ ...prev, input: e.target.value }))
                }
                onKeyDown={handleThreadKeyDown}
                disabled={isThreadLoading}
              />
              <button
                className="send-button"
                onClick={handleThreadSend}
                disabled={isThreadLoading}
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;