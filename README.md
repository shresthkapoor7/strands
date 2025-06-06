## ✨ About This Project

**Strands** is a personal conversational workspace built on top of modern AI models like Gemini. It introduces a unique threaded chat interface that allows users to branch off specific messages, creating deep, organized conversations — similar to Slack threads, but optimized for AI interaction.

- 🔁 Smart context queue management (user-controlled)
- 🧵 Threaded replies to any message
- 💬 Real-time chat interface with React + Express
- ☁️ Backend deployed on AWS EC2
- 🧠 Device-based persistence using localStorage (Web) and UIDevice (iOS)
- 🧪 Gemini model integration via API

**🔗 Repositories**
- 🌐 Web + Backend: [github.com/shresthkapoor7/strands-backend](https://github.com/shresthkapoor7/strands-backend)
- 📱 iOS App: [github.com/shresthkapoor7/strands-ios](https://github.com/shresthkapoor7/strands-ios)

---

### 📱 iOS Support (In Progress)

The native SwiftUI-based iOS app is actively under development. It already supports:

- ✅ Full chat interface with context queue
- ✅ Gemini API integration
- ✅ Threaded view navigation with new window stack
- ✅ Auto-title generation based on first response
- ✅ Bottom navigation with tab bar

Planned next:

- ⏳ Saving chat history
- ⏳ Authentication + syncing via Supabase

The iOS app shares the same backend as the web version, ensuring consistent conversation state across platforms in future releases.