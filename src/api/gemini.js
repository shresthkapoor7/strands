export async function sendMessageToGemini(contents) {
    try {
      const response = await fetch('https://api.strandschat.com/api/gemini', {
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