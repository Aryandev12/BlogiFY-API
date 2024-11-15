const mongoose = require("mongoose")
const User = require("./user.model.js")
const postSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the post
    category:{type:String,enum:[
        "Agriculture",
        "Business",
        "Education",
        "Entertainment",
        "Fashion",
        "Health",
        "Technology",
        "Travel",
        "Food",
        "Sports",
        "Music",
        "Science",
        "Politics",
        "Art",
        "Automotive",
        "Books",
        "Comics",
        "Crafts",
        "DIY",
        "Film",
        "Games",
        "Gardening",
        "Home",
        "Humor",
        "Lifestyle",
        "Pets",
        "Photography",
        "Religion",
        "Shopping",
        "Fitness",
        "Outdoors",
        "Parenting",
        "Beauty",
        "Relationships",
        "Spirituality",
        "Wellness",
        "Yoga",
        "History",
        "Language",
        "Architecture",
        "Design",
        "Environment",
        "Finance",
        "Mathematics",
        "Philosophy",
        "Psychology",
        "Sociology",
      
    ],message:"Value is not supported"},
    content: { type: String, required: true }, // Content/body of the post
    author: { type: mongoose.Schema.Types.ObjectId, ref: User, required: true }, // Reference to the User who authored the post
    thumbnail: [{ type: String }], // Array of photo URLs associated with the post
    createdAt: { type: Date, default: Date.now }, // Date and time when the post was created
    updatedAt: { type: Date, default: Date.now }, // Date and time when the post was last updated
    // Other post fields such as likes, comments, tags, etc.
  });

  const Post = mongoose.model("Post",postSchema)
  module.exports = Post  
