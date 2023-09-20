import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import Pusher from "pusher";
import dbModel from "./dbModel.js";
//app config

const app = express ();
const port = process.env.PORT || 8080

const pusher = new Pusher({
  appId: "1673028",
  key: "6ce2d297f9cf538eba1c",
  secret: "2fbf77975396924b2053",
  cluster: "mt1",
  useTLS: true
});

pusher.trigger("my-channel", "my-event", {
  message: "hello world"
});


//middlewares
app.use(express.json())
app.use(cors())

//DB config
const connection_url = 'mongodb+srv://admin:0807@cluster0.t0htm1u.mongodb.net/'
mongoose.connect(connection_url,{
    createIndexes: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
} );

mongoose.connection.once('open', ()=>{
    console.log('DB Connected')

    const changeStream = mongoose.connection.collection('posts').watch()

    changeStream.on('change', (change) =>{
        console.log('change triggered on pusher.')
        console.log(change)
        console.log('end of change.')

        if (change.operationType === 'insert') {
            console.log('triggering pusher *img upload*')

            const postDetails = change.fullDocument;
            pusher.trigger('posts', 'inserted', {
                    user: postDetails.user,
                    caption: postDetails.caption,
                    image: postDetails.image
            })
        } else {
            console.log('error triggering pusher')
        }
    })
})

//API routes
app.get('/', (req, res)=> res.status(200).send('hey'))

app.post ("/upload", (req, res) =>{
    const body = req.body;

dbModel.create(body, (err, data)=>{
    if (err) {
        res.status(500).send(err);
    } else {
        res.status(201).send(data);
    }
})
});

app.get('/sync', (req, res)=>{
    dbModel.find((err, data)=> {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(data);
        }  
    })
})

//Listeners
app.listen(port, ()=> console.log(`listening on localhost:${port}`))