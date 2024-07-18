import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import axios from "axios";

const port = 4001;
const app = express();

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const posts = {};

// Create Post - POST
app.post('/posts/create', async (req, res) => {
  const { title } = req.body;
  // Input validation
  if (!title || typeof title !== 'string') {
      return res.status(400).send({ error: 'Title is required and must be a string.' });
  }

  const id = randomBytes(4).toString('hex');
  const post = { id, title };
  posts[id] = post;
  // console.log(posts[id]);
  try {
      // Emit event
      const response = await axios.post("http://event-bus-srv:4002/events", {
          type: "PostCreated",
          data: post,
      });

      console.log(response);
      
      res.status(201).send(post);
  } catch (error) {
      console.error('Error posting event:', error.message);
      res.status(500).send({ error: 'Error creating post.' });
  }
});

// Send Post data - GET
app.get('/posts', (req, res) => {
    // Check if there are any posts
    if (Object.keys(posts).length > 0) {
        return res.status(200).send(posts);
    }

    // Send an appropriate response for no posts
    res.status(200).send({ message: "No posts available", posts: {} });
});

app.post("/events", (req, res) => {
    console.log("Received Event", req.body.type);
  
    res.send({});
  });

app.listen(port, () => {
    console.log(`Listening on port ${port} also its a new version`);
});
