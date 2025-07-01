import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import axios from 'axios';
import './ChangelogsPage.css';

const posts = [
  {
    id: 1,
    title: 'Why I switched from GitHub Pages to Vercel',
    url: 'https://raw.githubusercontent.com/shresthkapoor7/portfolio/main/public/blogs/1.md',
    date: 'July 26, 2024'
  },
];

function ChangelogsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [markdown, setMarkdown] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const selectedPost = id ? posts.find(p => p.id === parseInt(id, 10)) : null;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedPost) {
      axios.get(selectedPost.url)
        .then(response => {
          setMarkdown(response.data);
        })
        .catch(error => {
          console.error('Error fetching markdown:', error);
          setMarkdown('Failed to load post.');
        });
    } else {
      setMarkdown('');
    }
  }, [selectedPost]);

  const Sidebar = () => (
    <div className="changelogs-sidebar">
      <Link to="/home" className="back-to-home-btn">
        &larr; Back to Home
      </Link>
      <h1 className="changelogs-title">Changelogs</h1>
      <ul className="posts-list">
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/changelogs/${post.id}`} className={selectedPost && selectedPost.id === post.id ? 'active' : ''}>
              <span className="post-title">{post.title}</span>
              <span className="post-date">{post.date}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  const Content = () => (
    <div className="changelog-content">
      {isMobile && (
        <button onClick={() => navigate('/changelogs')} className="back-to-list-btn">
          &larr; All Changelogs
        </button>
      )}
      <div className="markdown-content-wrapper">
        {selectedPost ? (
          <ReactMarkdown children={markdown} remarkPlugins={[remarkGfm]} />
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
}

export default ChangelogsPage;