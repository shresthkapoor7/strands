import { fetchEventSource } from '@microsoft/fetch-event-source';

export async function sendMessageStream({
    llm,
    messages = [],
    onStreamChunk,
}) {
    const endpoint = "https://api.strandschat.com/api/chat-stream";

    let formattedMessages;
    formattedMessages = messages.map(m => ({
        role: m.sentBy === 0 ? "user" : "assistant",
        content: m.parts?.map(p => p.text).join('') || m.content
    }));

    const controller = new AbortController();

    return new Promise((resolve, reject) => {
        fetchEventSource(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: llm, messages: formattedMessages }),
            signal: controller.signal,

            onmessage(event) {
                if (event.event === 'done') {
                    controller.abort();
                    resolve();
                    return;
                }

                if (event.data) {
                    try {
                        const parsedData = JSON.parse(event.data);
                        if (onStreamChunk) {
                            onStreamChunk(parsedData);
                        }
                    } catch (err) {
                        console.warn("Failed to parse stream chunk:", err);
                    }
                }
            },

            onopen() {
                console.log("Stream connection opened.");
            },

            onerror(err) {
                console.error("Streaming error:", err);
                controller.abort();
                reject(err);
            },
        });
    });
}