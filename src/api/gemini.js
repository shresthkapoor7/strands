export async function sendMessageToGemini(contents, browserEnabled = false) {
  try {
    const endpoint = browserEnabled
      ? 'https://api.strandschat.com/api/gemini-search'
      : 'https://api.strandschat.com/api/gemini';

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents })
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