import express from "express";
import cors from "cors";
import { randomBytes } from "crypto";
import axios from "axios";

const Port = 4000;
const app = express();

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const commentOnPost = {};

//create comment - POST
app.post("/posts/:id/comments",async(req,res) => {
    const commentId = randomBytes(4).toString('hex');
    const {content} = req.body;

    const comments = commentOnPost[req.params.id] || [];
    comments.push({id : commentId, content, status : "pending"});

    commentOnPost[req.params.id] = comments;

    await axios.post('http://event-bus-srv:4002/events',{
        type : "CommentCreated",
        data : {
            id : commentId,
            content,
            postId : req.params.id,
            status : "pending",
        }
    })

    res.status(201).send(comments);

})

//get information from events
app.post('/events', async(req,res)=>{
    console.log("Event received",req.body.type);

    const {type, data} = req.body;

    if(type === "CommentModerated"){
        const {postId, id, status, content} = data;
        const comments = commentOnPost[postId];

        const comment = comments.find((comment) => comment.id === id);

        comment.status = status;

        await axios.post('http://event-bus-srv:4002/events',{
            type : "CommentUpdated",
            data : {
                id,
                content,
                postId,
                status
            }
        });
    }
    res.send({});
})

//send comments - GET
app.get("/posts/:id/comments",(req,res) => {
    res.send(commentOnPost[req.params.id] || []);
})


app.listen(Port,()=>{
    console.log(`Listening on port ${Port}`);
})