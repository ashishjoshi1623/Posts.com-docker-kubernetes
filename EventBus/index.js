import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended : true}))

const Port = 4002;

const events = [];

app.get('/events',(req,res)=>{
    res.send(events);
})

app.post('/events',(req,res)=>{
    const event = req.body;
    console.log(event);
    events.push(event);

    axios.post('http://comment-srv:4000/events',event).catch((err) => {
        console.log("sending event to comment service failed");
    })
    axios.post('http://posts-srv:4001/events',event).catch((err) => {
        console.log("sending event to Post service failed");
    })
    axios.post('http://query-srv:4003/events',event).catch((err) => {
        console.log("sending event to Query service failed");
    })
    axios.post('http://moderation-srv:4004/events',event).catch((err) => {
        console.log("sending event to moderate service failed");
    })

    res.sendStatus(201);
})

app.listen(Port,()=>{
    console.log(`app listening on ${Port}`);
})