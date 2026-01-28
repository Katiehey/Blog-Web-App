import express from "express";
import ejsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const app = express();
const port = 3000;

// Path fix for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File path for JSON storage
const DATA_FILE = path.join(__dirname, "data", "posts.json");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
try {
  await fs.access(dataDir);
} catch {
  await fs.mkdir(dataDir);
}

// Initialize empty posts file if it doesn't exist
try {
  await fs.access(DATA_FILE);
} catch {
  await fs.writeFile(DATA_FILE, "[]", "utf-8");
}

// Helper function to read posts
async function readPosts() {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// Helper function to write posts
async function writePosts(posts) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(posts, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing posts:", error);
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(ejsLayouts);

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");

// Routes
app.get("/", async (req, res) => {
  const posts = await readPosts();
  res.render("pages/home", { posts, title: "Home" });
});

app.get("/compose", (req, res) => {
  res.render("pages/compose", { title: "Compose" });
});

// Handle form submission
app.post("/submit", async (req, res) => {
  const { title, content } = req.body;
  
  const newPost = {
    id: uuidv4(),
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const posts = await readPosts();
  posts.unshift(newPost); // Add to beginning for newest first
  await writePosts(posts);
  
  res.redirect("/");
});

// Dynamic route for individual posts
app.get("/posts/:id", async (req, res) => {
  const id = req.params.id;
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);

  if (post) {
    res.render("pages/post", { title: `Post: ${post.title}`, post, id });
  } else {
    res.status(404).render("pages/404", { title: "Not Found" });
  }
});

// Edit post route
app.get("/posts/:id/update", async (req, res) => {
  const id = req.params.id;
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  res.render("pages/edit", { title: "Edit Post", post });
});

// Handle edit form submission
app.post("/posts/:id/update", async (req, res) => {
  const id = req.params.id;
  const { title, content } = req.body;
  
  const posts = await readPosts();
  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex === -1) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  // Update the post
  posts[postIndex] = {
    ...posts[postIndex],
    title,
    content,
    updatedAt: new Date().toISOString()
  };

  await writePosts(posts);
  res.redirect(`/posts/${id}`);
});

// Handle delete post
app.post("/posts/:id/delete", async (req, res) => {
  const id = req.params.id;
  
  const posts = await readPosts();
  const filteredPosts = posts.filter((p) => p.id !== id);

  if (posts.length === filteredPosts.length) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  await writePosts(filteredPosts);
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});