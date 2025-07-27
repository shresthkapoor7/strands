import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChangeLogs.css';

interface PostConfig {
  id: number;
  filePath: string;
}

interface Frontmatter {
  id?: string;
  date?: string;
  title?: string;
}

interface PostData {
  id: number;
  title: string;
  date: string;
  content: string;
}

interface ParsedMarkdown {
  frontmatter: Frontmatter;
  content: string;
}

const posts: PostConfig[] = [
  {
    id: 1,
    filePath: '/src/pages/ChangeLogs/Logs/1.md'
  },
  {
    id: 2,
    filePath: '/src/pages/ChangeLogs/Logs/2.md'
  },
  {
    id: 3,
    filePath: '/src/pages/ChangeLogs/Logs/3.md'
  },
  {
    id: 4,
    filePath: '/src/pages/ChangeLogs/Logs/4.md'
  }
];

const parseFrontmatter = (content: string): ParsedMarkdown => {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterText = match[1];
    const markdownContent = match[2];

    const frontmatter: Frontmatter = {};
    frontmatterText.split('\n').forEach((line: string) => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        frontmatter[key.trim() as keyof Frontmatter] = valueParts.join(':').trim();
      }
    });

    return {
      frontmatter,
      content: markdownContent
    };
  }

  return {
    frontmatter: {},
    content: content
  };
};

const ChangeLogs: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState<string>('');
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  const selectedPost = id ? postsData.find(p => p.id === parseInt(id, 10)) : null;

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadPosts = async (): Promise<void> => {
      const loadedPosts: PostData[] = [];

      for (const post of posts) {
        try {
          const response = await fetch(`${process.env.PUBLIC_URL}/Logs/${post.id}.md`);
          if (response.ok) {
            const content = await response.text();
            const { frontmatter, content: markdownContent } = parseFrontmatter(content);

            loadedPosts.push({
              id: post.id,
              title: frontmatter.title || `Post ${post.id}`,
              date: frontmatter.date || 'Unknown date',
              content: markdownContent
            });
          } else {
            loadedPosts.push({
              id: post.id,
              title: `Post ${post.id}`,
              date: 'Unknown date',
              content: 'Content not available'
            });
          }
        } catch (error) {
          console.error(`Error loading post ${post.id}:`, error);
          loadedPosts.push({
            id: post.id,
            title: `Post ${post.id}`,
            date: 'Unknown date',
            content: 'Error loading content'
          });
        }
      }

      setPostsData(loadedPosts);
    };

    loadPosts();
  }, []);

  useEffect(() => {
    if (selectedPost) {
      setMarkdown(selectedPost.content || 'Content not available');
    } else {
      setMarkdown('');
    }
  }, [selectedPost]);

  const Sidebar: React.FC = () => (
    <div className="changelogs-sidebar">
      <Link to="/home" className="back-to-home-btn">
        &larr; Back to Home
      </Link>
      <h1 className="changelogs-title">Changelogs</h1>
      <ul className="posts-list">
        {postsData.map((post: PostData) => (
          <li key={post.id}>
            <Link
              to={`/changelogs/${post.id}`}
              className={selectedPost && selectedPost.id === post.id ? 'active' : ''}
            >
              <span className="post-title">{post.title}</span>
              <span className="post-date">{post.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const Content: React.FC = () => (
    <div className="changelog-content">
      {isMobile && (
        <button onClick={() => navigate('/changelogs')} className="back-to-list-btn">
          &larr; All Changelogs
        </button>
      )}
      <div className="markdown-content-wrapper">
        {selectedPost ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {markdown}
          </ReactMarkdown>
        ) : (
          !isMobile && (
            <div className="no-post-selected">
              <h2>Select a post to read</h2>
              <p>Choose a changelog from the list on the left to view its content.</p>
            </div>
          )
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="changelogs-container">
        {id ? <Content /> : <Sidebar />}
      </div>
    );
  }

  return (
    <div className="changelogs-container">
      <Sidebar />
      <Content />
    </div>
  );
};

export default ChangeLogs;