import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Message from "../../models/Message";
import "./ChatPage.css";
import { sendMessageToGemini } from "../../api/gemini";
import { sendMessageStream } from "../../api/chat";

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
  const [browserSearchEnabled, setBrowserSearchEnabled] = useState(false);
  const [llm, setLlm] = useState("gemini");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const modelDropdownRef = useRef(null);
  const [isContextModalOpen, setIsContextModalOpen] = useState(false);

  const models = [
    // { name: "maverick", icon: "Ⓜ️", modelFull: "meta-llama/llama-4-maverick:free"},
    { name: "gemma", icon: "🐵", modelFull: "google/gemma-3n-e4b-it:free"},
    { name: "mistral", icon: "🐯", modelFull: "mistralai/mistral-7b-instruct:free"},
    { name: "deepseek", icon: "🐶", modelFull: "deepseek/deepseek-r1-0528:free"},
    { name: "deepseek-chat", icon: "🌀", modelFull: "deepseek/deepseek-chat-v3-0324:free"},
    { name: "qwen3", icon: "🏗️", modelFull: "qwen/qwen3-235b-a22b:free"},
    { name: "gemini", icon: "🟠", modelFull: "google/gemini-2.5-flash"},
  ]

  const textareaRef = useRef(null);
  const threadTextareaRef = useRef(null);

  const fetchChatMessages = async (chatId) => {
    try {
      const res = await fetch(`https://api.strandschat.com/api/get-chat/${chatId}`);
      const data = await res.json();
      if (res.ok) {

        const sortedMessages = data.messages.sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          if (timeA !== timeB) return timeA - timeB;
          return a.sentBy - b.sentBy;
        });

        return sortedMessages;
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
    if (!chatId) return;

    setMessages([]);
    setChatTitle(null);
    setIsLoading(true);

    const loadMessages = async () => {
      const fetched = await fetchChatMessages(chatId);
      const parsedMessages = fetched.map(msg => new Message(msg));
      const mainMessages = parsedMessages.filter(msg => !msg.strand);

      setMessages(mainMessages);
      setMessageStore(parsedMessages);

      if (parsedMessages.length > 0) {
        setChatTitle(parsedMessages[0].chatTitle);
      } else {
        setChatTitle(shortId);
      }

      const lastTenMain = mainMessages.slice(-10);
      setContextQueue(lastTenMain);
    };

    loadMessages().finally(() => setIsLoading(false));
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target)) {
        setModelDropdownOpen(false);
      }
    }
    if (modelDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modelDropdownOpen]);

  const handleSend = async () => {
    if (userInput.trim() === "") return;

    const userMessage = Message.createUserMessage(chatId, userInput, false, null, chatTitle);

    setMessages((prev) => [...prev, userMessage]);
    setMessageStore((prev) => [...prev, userMessage]);
    updateContextQueue(userMessage);
    setUserInput("");
    setIsLoading(true);

    const assistantMessage = new Message({
      chatId,
      sentBy: 1,
      text: "",
      strand: false,
      parentChatId: null,
      chatTitle
    });

    setMessages((prev) => [...prev, assistantMessage]);
    setMessageStore((prev) => [...prev, assistantMessage]);

    try {
      const conversationContext = [...contextQueue, userMessage].map(msg => msg.toApiFormat());
      if (!browserSearchEnabled && llm !== "gemini") {
        await sendMessageStream({
          llm: llm,
          messages: conversationContext,
          onStreamChunk: (parsedChunk) => {
            assistantMessage.text += parsedChunk.text || "";
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessage.id
                  ? { ...msg, text: assistantMessage.text }
                  : msg
              )
            );
          }
        });
      }

      else {
        let accumulatedText = "";

        await sendMessageToGemini(
          conversationContext,
          browserSearchEnabled,
          (chunk) => {
            if (chunk.text) {
              accumulatedText += chunk.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, text: accumulatedText }
                    : msg
                )
              );
            }

            if (chunk.sources) {
              accumulatedText += `\n\n**Sources:**\n${chunk.sources}`;
            }
          }
        );
        assistantMessage.text = accumulatedText;
      }

      updateContextQueue(assistantMessage);

      const updatedQueue = [...contextQueue, userMessage, assistantMessage];
      const hasUserMessage = updatedQueue.some(msg => msg.sentBy === 0);
      const hasLLMResponse = updatedQueue.some(msg => msg.sentBy === 1);
      const totalMessages = updatedQueue.length;

      if (hasUserMessage && hasLLMResponse && totalMessages === 2) {
        try {
          const namePrompt = {
            role: "user",
            parts: [{
              text: "Based on this conversation, generate a short, descriptive title (max 5 words) for this chat. Only respond with the title, nothing else."
            }]
          };

          let titleText = "";

          await sendMessageToGemini(
            [...updatedQueue.map(msg => msg.toApiFormat()), namePrompt],
            browserSearchEnabled,
            (chunk) => {
              if (chunk.text) {
                titleText += chunk.text;
              }
            },
            true
          );

          const newTitle = titleText.trim();
          if (newTitle) {
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
          }
        } catch (titleError) {
          console.error("Error generating chat title:", titleError);
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
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
    );

    setActiveThread((prev) => ({
      ...prev,
      replies: [...prev.replies, userReply],
      input: "",
    }));

    updateThreadContextQueue(userReply);
    setMessageStore((prev) => [...prev, userReply]);
    setIsThreadLoading(true);

    const assistantReply = new Message({
      chatId,
      sentBy: 1,
      text: "",
      strand: true,
      parentChatId: activeThread.parent.id,
      chatTitle
    });

    setActiveThread((prev) => ({
      ...prev,
      replies: [...prev.replies, assistantReply],
    }));

    setMessageStore((prev) => [...prev, assistantReply]);

    try {
      const threadContext = threadContextQueue.map(msg =>
        msg.toApiFormat ? msg.toApiFormat() : new Message(msg).toApiFormat()
      );
      threadContext.push(userReply.toApiFormat());
      if (llm === "gemini") {
        let accumulatedText = "";

        await sendMessageToGemini(
          threadContext,
          browserSearchEnabled,
          (chunk) => {
            if (chunk.text) {
              accumulatedText += chunk.text;
              setActiveThread((prev) => ({
                ...prev,
                replies: prev.replies.map((msg) =>
                  msg.id === assistantReply.id
                    ? { ...msg, text: accumulatedText }
                    : msg
                ),
              }));
            }
          }
        );
        assistantReply.text = accumulatedText;
      }
      else {
        await sendMessageStream({
          llm: llm,
          messages: threadContext,
          onStreamChunk: (parsedChunk) => {
            assistantReply.text += parsedChunk.text;
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantReply.id
                  ? { ...msg, text: assistantReply.text }
                  : msg
              )
            );
          }
        });
      }
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
    console.log(allMessages);
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

  const handleAddMessageToMainQueue = (messageToAdd) => {
    setContextQueue(prevQueue => {
      if (prevQueue.some(msg => msg.id === messageToAdd.id)) return prevQueue;
      const updatedQueue = [...prevQueue, messageToAdd].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return updatedQueue.length > MAX_CONTEXT_SIZE_MAIN_CHAT
        ? updatedQueue.slice(updatedQueue.length - MAX_CONTEXT_SIZE_MAIN_CHAT)
        : updatedQueue;
    });
  };

  const handleAddMessageToThreadQueue = (messageToAdd) => {
    if (!activeThread) return;
    setThreadContextQueue(prevQueue => {
      if (prevQueue.some(msg => msg.id === messageToAdd.id)) return prevQueue;
      const updatedQueue = [...prevQueue, messageToAdd].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      return updatedQueue.length > MAX_CONTEXT_SIZE_THREAD_CHAT
        ? updatedQueue.slice(updatedQueue.length - MAX_CONTEXT_SIZE_THREAD_CHAT)
        : updatedQueue;
    });
  };

  const handleDeleteFromQueue = (queueType, index) => {
    if (queueType === 'main') {
      setContextQueue(prev => prev.filter((_, i) => i !== index));
    } else if (queueType === 'thread') {
      setThreadContextQueue(prev => prev.filter((_, i) => i !== index));
    }
  };

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const [isCopied, setIsCopied] = useState(false);
    const match = /language-(\w+)/.exec(className || '');
    const lang = match ? match[1] : '';

    const handleCopy = () => {
      navigator.clipboard.writeText(String(children).replace(/\n$/, '')).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    };

    return !inline && match ? (
      <div className="code-block-container">
        <div className="code-block-header">
          <span>{lang}</span>
          <button onClick={handleCopy} className="copy-button">
            {isCopied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <SyntaxHighlighter style={atomDark} language={lang} PreTag="div" customStyle={{ margin: 0 }} {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  const ContextModal = ({ isOpen, onClose, mainQueue, threadQueue, activeThread, allMessages, onDelete, onAddToMain, onAddToThread }) => {
    const [activeTab, setActiveTab] = useState('main');
    const [expandedMessages, setExpandedMessages] = useState({});

    useEffect(() => {
      if (!activeThread) {
        setActiveTab('main');
      }
    }, [activeThread]);

    // Reset expanded state when modal is closed
    useEffect(() => {
      if (!isOpen) {
        setExpandedMessages({});
      }
    }, [isOpen]);

    const toggleExpand = (id) => {
      setExpandedMessages(prev => ({
        ...prev,
        [id]: !prev[id]
      }));
    };

    const renderMessages = (queue, tabName, isQueue) => {
      return queue.map((msg, index) => {
        const id = `${tabName}-${index}`;
        const isExpanded = expandedMessages[id];
        const TRUNCATE_LENGTH = 150;
        const isLong = msg.text.length > TRUNCATE_LENGTH;
        const textToShow = isExpanded || !isLong ? msg.text : `${msg.text.substring(0, TRUNCATE_LENGTH)}...`;

        const handleDelete = (e) => {
          e.stopPropagation();
          onDelete(tabName, index);
        };

        const handleAddToMain = (e) => {
          e.stopPropagation();
          onAddToMain(msg);
        };

        const handleAddToThread = (e) => {
          e.stopPropagation();
          onAddToThread(msg);
        };

        return (
          <div
            key={id}
            className={`queue-message ${msg.sentBy === 0 ? 'user' : 'assistant'} ${isLong ? 'expandable' : ''}`}
            onClick={() => isLong && toggleExpand(id)}
          >
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                {textToShow}
              </ReactMarkdown>
            </div>
            {isQueue ? (
              <button className="queue-message-delete-btn" onClick={handleDelete}>×</button>
            ) : (
              <div className="queue-message-actions">
                <button className="queue-action-btn" onClick={handleAddToMain}>+ Main</button>
                {activeThread && (
                  <button className="queue-action-btn" onClick={handleAddToThread}>+ Thread</button>
                )}
              </div>
            )}
          </div>
        );
      });
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="modal-close-button">×</button>
          <h2>Context Queues</h2>
          <div className="modal-tabs">
            <button className={`modal-tab ${activeTab === 'main' ? 'active' : ''}`} onClick={() => setActiveTab('main')}>
              Main ({mainQueue.length}/{MAX_CONTEXT_SIZE_MAIN_CHAT})
            </button>
            {activeThread && (
              <button className={`modal-tab ${activeTab === 'thread' ? 'active' : ''}`} onClick={() => setActiveTab('thread')}>
                Thread ({threadQueue.length}/{MAX_CONTEXT_SIZE_THREAD_CHAT})
              </button>
            )}
            <button className={`modal-tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              All ({allMessages.length})
            </button>
          </div>

          {activeTab === 'main' && (
            <div className="queue-section">
              <div className="queue-messages">
                {renderMessages(mainQueue, 'main', true)}
              </div>
            </div>
          )}
          {activeTab === 'thread' && activeThread && (
            <div className="queue-section">
              <div className="queue-messages">
                {renderMessages(threadQueue, 'thread', true)}
              </div>
            </div>
          )}
          {activeTab === 'all' && (
            <div className="queue-section">
              <div className="queue-messages">
                {renderMessages(allMessages, 'all', false)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`chat-container ${activeThread ? "drawer-open" : ""}`}>
      <div className="main-chat">
        <div className="chat-header">
          <div className="chat-title-row" style={modelDropdownOpen ? { overflow: 'visible' } : {}}>
            <h1 className="chat-title">
              {chatTitle} <span className="chat-id">#{shortId}</span>
            </h1>
            <div className="model-dropdown-wrapper" ref={modelDropdownRef}>
              <button
                className="model-dropdown-btn"
                onClick={() => setModelDropdownOpen((open) => !open)}
              >
                {models.find((m) => m.name === llm)?.icon} {models.find((m) => m.name === llm)?.name}
                <span style={{ marginLeft: 6 }}>▼</span>
              </button>
              {modelDropdownOpen && (
                <div className="model-dropdown-menu">
                  {models.map((model) => (
                    <div
                      key={model.name}
                      className={`model-dropdown-item${llm === model.name ? ' selected' : ''}`}
                      onClick={() => {
                        setLlm(model.name);
                        setModelDropdownOpen(false);
                      }}
                    >
                      <span className="model-icon">{model.icon}</span>
                      <span className="model-full">{model.modelFull}</span>
                      {llm === model.name && <span className="model-check">✔</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <a className="view-context-button"
              onClick={async () => {
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
            <button className="view-context-button" onClick={() => setIsContextModalOpen(true)}>
              View Context
            </button>
          </div>
        </div>

        <div className="chat-body">
          {messages.length !== 0 ? (
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={`chat-bubble ${msg.sentBy === 0 ? "user" : "assistant"}`}>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
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
            </div>
          ) : (
            !isLoading && (
              <div className="chat-placeholder-container">
                  Your conversation starts here 🚀
              </div>
            )
          )}
          {isLoading && (
            <div className="loading-container">
              <div className="loading-bubble">
                <div className="loading-dots">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <div className="input-wrapper">
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
            <button
              className="send-icon-button"
              onClick={handleSend}
              disabled={userInput.trim() === "" || isLoading}
            >
              <span className="arrow-icon">↑</span>
            </button>
          </div>
        </div>
      </div>

      {activeThread && (
        <div
          className="resize-handle"
          onMouseDown={handleResizeStart}
        />
      )}

      {activeThread && (
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
            <div className="chat-bubble assistant">
              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                  {truncateText(activeThread.parent.text, 1)}
                </ReactMarkdown>
              </div>
              <div className="parent-message-more">
                <span className="message-count">
                  {activeThread.parent.text.split(/(?<=[.!?])\s+/).length} sentences
                </span>
              </div>
            </div>
            {activeThread.replies.map((reply) => (
              <div
                key={reply.id}
                className={`chat-bubble ${reply.sentBy === 0 ? 'user' : 'assistant'}`}
              >
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ code: CodeBlock }}>
                    {reply.text}
                  </ReactMarkdown>
                </div>
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
            <div className="input-wrapper">
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
              <button
                className="send-icon-button"
                onClick={handleThreadSend}
                disabled={activeThread.input.trim() === "" || isThreadLoading}
              >
                <span className="arrow-icon">↑</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ContextModal
        isOpen={isContextModalOpen}
        onClose={() => setIsContextModalOpen(false)}
        mainQueue={contextQueue}
        threadQueue={threadContextQueue}
        activeThread={activeThread}
        allMessages={messageStore}
        onDelete={handleDeleteFromQueue}
        onAddToMain={handleAddMessageToMainQueue}
        onAddToThread={handleAddMessageToThreadQueue}
      />
    </div>
  );
}

export default ChatPage;