import { fetchEventSource } from '@microsoft/fetch-event-source';

export async function sendMessageToGemini(contents, browserEnabled = false, onStreamChunk) {
  const endpoint = browserEnabled
    ? 'https://api.strandschat.com/api/gemini-search'
    : 'https://api.strandschat.com/api/chat';

  const isStreaming = !browserEnabled;

  const formattedMessages = contents.map((msg) => {
    let role = msg.role;
    if (!role) {
      role = msg.sentBy === 0 ? "user" : "model";
    } else if (role === "assistant") {
      role = "model";
    }

    return {
      role,
      parts: msg.parts || [{ text: msg.text }],
    };
  });

  if (isStreaming) {
    const controller = new AbortController();

    return new Promise((resolve, reject) => {
      fetchEventSource(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: formattedMessages }),
        signal: controller.signal,

        onmessage(event) {
          if (event.event === 'done') {
            controller.abort();
            resolve();
            return;
          }

          if (event.data) {
            try {
              const parsed = JSON.parse(event.data);
              if (onStreamChunk) {
                onStreamChunk(parsed);
              }
            } catch (err) {
              console.warn("Failed to parse stream chunk:", err);
            }
          }
        },

        onerror(err) {
          console.error("Streaming error:", err);
          controller.abort();
          reject(err);
        },
      });
    });
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: formattedMessages }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error in sendMessageToGemini:', err);
    throw err;
  }
}