const Post = require("../models/post.model")
const User = require("../models/user.model")
const HttpError = require("../models/errorModel")
const path = require('path')
const fs= require("fs")
const {v4:uuid}= require('uuid')

//================Create Post ===============
//Post Route
//api/posts/createpost
const createPost = async (req,res,next)=>{
   
    try {
        const {title,category,content}=req.body;
        if(!title || !category || !content || !req.files){
            return next(new HttpError("All Fields are required.",422))
        }
        const {thumbnail} = req.files
        //check the file size. 
        if(thumbnail.size >2000000){
            return next(new HttpError("Thumbnail is too big . File size should less than 2mb."))
        }
        console.log(thumbnail)
        let fileName = thumbnail.name
        let splittedFileName = fileName.split('.')
        let newFileName = splittedFileName[0]+uuid()+"."+splittedFileName[splittedFileName.length-1]
         thumbnail.mv(path.join(__dirname,'..','/uploads',newFileName),async (err)=>{
            if(err){
                return next(new HttpError(err))
            }else{
                const newPost = await Post.create({title,category,content,thumbnail:newFileName,author:req.user.id})
                if(!newPost){
                    return next(new HttpError("Post creation failed."))
                }
                //find user and increment post count by one.
                const currentUser = await User.findById(req.user.id)
                const userPostCount = currentUser.posts+1;
               
                await User.findByIdAndUpdate(req.user.id,{posts:userPostCount})
                res.status(201).json(newPost)

            } 

         })


        
    } catch (error) {
        return next(new HttpError(error))
        
    }
}


//====================Edit Post==============

//Patch Route.
//api/posts/editpost/:id
//Protected
const editPost = async (req,res,next)=>{
    try {
        let updatedPost
        let {id} = req.params
        let {title,category,content} = req.body
        if(!title || !category || !content){
            return next(new HttpError("All Fields are required."))
        }
        const oldPost = await Post.findById(id)
        if(req.user.id == oldPost.author){
        if(!req.files){
             updatedPost = await Post.findByIdAndUpdate(id,{title,category,content},{new:true})  
        }else{
           
            //delete old thumbnail and upload new
            fs.unlink(path.join(__dirname,'..','/uploads',oldPost.thumbnail[0]),async (err)=>{
                if(err){
                    return next(new HttpError("Error in Uploading thumbnail."))
                }
               

            })
            const {thumbnail}= req.files
            if(thumbnail.size>2000000){
                return next(new HttpError("Thumbnail  is too big."))
            }
            let splittedFileName= thumbnail.name.split('.')
            let newFileName = splittedFileName[0]+ uuid()+ '.' +splittedFileName[splittedFileName.length-1]
            thumbnail.mv(path.join(__dirname,'..','/uploads',newFileName),async (err)=>{
                if(err){
                    return next(new HttpError(err))
                }
                
                
            })
            updatedPost=await Post.findByIdAndUpdate(id,{title,category,content,thumbnail:newFileName},{new:true})
                     
 



        }
        res.status(200).json(updatedPost)
    }
    else{
        return next(new HttpError("Only the author will edit the post . You have no rights to edit this post."))

    }
 
        





        
    } catch (error) {
        return next(new HttpError(error))
        
    }
    
}



//========================Delete Post ==================
//DELETE Route.
//api/posts/deletepost/:id
const deletePost = async (req,res,next)=>{
try {
    const postId= req.params.id
    if(!postId){
        return next(new HttpError("Post Unavailable"))
    }

    const post = await Post.findById(postId)
    if(req.user.id== post.author){
        const thumbnail= post?.thumbnail[0]
    fs.unlink(path.join(__dirname,'..','/uploads',thumbnail),async (err)=>{
        if(err){
            return next(new HttpError(err))
        }
          else{
            await Post.findByIdAndDelete(postId)
            //find user and reduce post count by 1.
            const currentUser = await User.findById(req.user.id)
            const userPostCount = currentUser.posts-1
            await User.findByIdAndUpdate(req.user.id,{posts:userPostCount},{new:true})
            res.json(`Post ${postId} deleted successfully.`)
          }
    })
    }else{
        return next(new HttpError("Post couldnot be deleted."))
    }
    


   
} catch (error) {
    return next(new HttpError(error))
    
}
}



//------------------Get All Posts --------------------
//Get :api/posts/
const getPosts = async(req,res,next)=>{

    try {
        const posts = await Post.find().sort({updatedAt:-1})
        res.status(200).json(posts)
    } catch (error) {
        return next(new HttpError("Something went wrong"+error))
        
    }
 
}



//-------------------Get SIngle Post ----------------------------
//Get :api/posts/:id
//Unprotected.
const getSinglePost = async (req,res,next)=>{
    try {
        const postId = req.params.id
        const post = await Post.findById(postId)
        if(!post){
            return next(new HttpError("Post not found."))
        }
        res.status(200).json(post)

        
    } catch (error) {
        return next(new HttpError(error))
        
    }
}


//----------------------Get Post By Authors-------------------------
//Get : api/posts/users/:id
const getUserPosts = async(req,res,next)=>{
    try {
        const {id}= req.params
        const posts = await Post.find({author:id}).sort({createdAt:-1})
        if(posts.length==0){
            return next(new HttpError("No post from this User."))
        }
        res.status(200).json(posts)
        
    } catch (error) {
        return next(new HttpError(error))
        
    }
    
}

//-----------------------get Post by Category-----------------------
//Get : api/posts/categories/:category
const getPostByCategory = async(req,res,next)=>{
    try {
        const category = req.params.category
        const post = await Post.find({category:category}).sort({createdAt:-1})
        if(post.length==0){
            return next(new HttpError("No post in this category."))
        }
        res.status(200).json(post)
        
    } catch (error) {
        return next(new HttpError(error))
        
    }
   
    
}
module.exports={
    createPost,
    editPost,
    deletePost,
    getPosts,
    getSinglePost,
    getPostByCategory,
    getUserPosts
}