const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9876;

let cache = {
  users: null,
  posts: null,
  lastUpdated: null
};

// Fetch users from test server
async function fetchUsers() {
  const response = await axios.get('http://20.244.56.144/evaluation-service/users');
  return response.data.users; // Format: { "1": "John Doe", ... }
}

// Fetch posts from test server (assumed endpoint)
async function fetchPosts() {
  const response = await axios.get('http://20.244.56.144/evaluation-service/posts');
  return response.data.posts; // Format: [{ id, userId, content, timestamp, comments: [] }, ...]
}

// API 1: Top 5 Users by Post Count
app.get('/users', async (req, res) => {
  try {
    const users = await fetchUsers();
    const posts = await fetchPosts();

    // Count posts per user
    const userPostCounts = {};
    posts.forEach(post => {
      userPostCounts[post.userId] = (userPostCounts[post.userId] || 0) + 1;
    });

    // Sort users by post count (descending)
    const topUsers = Object.keys(users)
      .map(userId => ({
        id: userId,
        name: users[userId],
        postCount: userPostCounts[userId] || 0
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);

    res.json(topUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// API 2: Top/Latest Posts
app.get('/posts', async (req, res) => {
  try {
    const { type } = req.query; // 'popular' or 'latest'
    const posts = await fetchPosts();

    if (type === 'popular') {
      // Find post(s) with max comments
      let maxComments = 0;
      const popularPosts = [];
      posts.forEach(post => {
        const commentCount = post.comments.length;
        if (commentCount > maxComments) {
          maxComments = commentCount;
          popularPosts.length = 0; // Reset array
        }
        if (commentCount === maxComments) {
          popularPosts.push(post);
        }
      });
      res.json(popularPosts);
    } else if (type === 'latest') {
      // Sort by timestamp (newest first)
      const latestPosts = posts
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      res.json(latestPosts);
    } else {
      res.status(400).json({ error: "Invalid type parameter" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));