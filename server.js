import express from "express";
import ejsLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = 3000;

// Path fix for ES modules
const __filename = fileURLToPath(import.meta.url);
//console.log(__filename);
const __dirname = path.dirname(__filename);
//console.log(__dirname);

// Middleware
app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(express.static(path.join(__dirname, "public"))); // To serve static files
app.use(ejsLayouts); // Use EJS layouts

// Set EJS
app.set("view engine", "ejs"); // Set the view engine to EJS. Make sure ejs is installed via npm. 
app.set("views", path.join(__dirname, "views")); // Set the views directory
app.set("layout", "layouts/layout"); // Default layout file

// Temporary in-memory storage. Every time the server restarts, the data resets
let posts = [];


// Routes
app.get("/", (req, res) => {
  res.render("pages/home", { posts, title: "Home" });
});

app.get("/compose", (req, res) => {
  res.render("pages/compose", { title: "Compose" });
});

// Handle form submission
app.post("/submit", (req, res) => {
  //const { title, content } = req.body;
  const title = req.body.title;
  const content = req.body.content;

  // Give each post an ID
  const newPost = {
    id: Date.now().toString(),
    title: title,
    content: content,
  };

  posts.push(newPost);
  //const { title, content } = req.body;
  //posts.push({ id, title, content }); // Store post in memory

  res.redirect("/");
});

// Dynamic route for individual posts
app.get("/posts/:id", (req, res) => {
  const id = req.params.id;

  const post = posts.find((p) => p.id === id);
  //const post = posts[id];

  if (post) {
    res.render("pages/post", { title: `Post: ${post.title}`, post, id: id });
  } else {
    res.status(404).render("pages/404", { title: "Not Found" });
  }
});

// Edit post route
app.get("/posts/:id/update", (req, res) => {
  const id = req.params.id;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  res.render("pages/edit", { title: "Edit Post", post });
});

// Handle edit form submission
app.post("/posts/:id/update", (req, res) => {
  const id = req.params.id;
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  // Update the post
  post.title = req.body.title;
  post.content = req.body.content;

  // Redirect back to the updated post
  res.redirect(`/posts/${id}`);
});

// Handle delete post
app.post("/posts/:id/delete", (req, res) => {
  const { id } = req.params;  // Changed from req.body to req.params

  // Find index of post
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).render("pages/404", { title: "Not Found" });
  }

  // Remove the post
  posts.splice(index, 1);

  // Redirect to posts homepage
  res.redirect("/");
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
