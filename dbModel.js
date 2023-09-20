import mongoose from "mongoose";

//Creating Schema for every document being pushed into DB
const instance = mongoose.Schema({
    caption: String,
    user: String,
    image: String,
    comments: [],
});

export default mongoose.model('post', instance);