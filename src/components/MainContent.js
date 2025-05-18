function MainContent() {
    return (
      <div className="main-content">
        <h1 className="main-title">Welcome to Strands 👋</h1>

        <p className="main-description">
          <strong>Strands</strong> is your personal conversational space — powered by the latest AI models like Gemini and ChatGPT,
          but with one major upgrade: <strong>threaded conversations</strong>. 🧵
        </p>

        <p className="main-description">
          Instead of a flat, endless chat history, Strands lets you naturally branch conversations, ask follow-up questions,
          explore alternative ideas — without ever losing the flow.
        </p>

        <p className="main-description">
          ✨ Think of it like Slack threads, but built specifically for deep AI chats.
        </p>

        <p className="main-description">
          Whether you're brainstorming, researching, or learning something new — Strands helps you stay organized and think clearly.
        </p>

        <div className="main-links">
          <a
            href="https://github.com/shresthkapoor7/strands"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            View Project on GitHub 🚀
          </a>
        </div>
      </div>
    );
  }

  export default MainContent;