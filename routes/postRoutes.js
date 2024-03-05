const {Router} = require("express")
const router = Router()
const {
    createPost,
    editPost,
    deletePost,
    getPosts,
    getSinglePost,
    getPostByCategory,
    getUserPosts
} = require('../controllers/postControllers')
const authMiddleware = require("../middleware/authMiddleware")

router.get('/',getPosts)
router.post('/createpost',authMiddleware,createPost)
router.delete('/deletepost/:id',authMiddleware,deletePost)
router.patch('/editpost/:id',authMiddleware,editPost)
router.get('/categories/:category',getPostByCategory)
router.get('/:id',getSinglePost)
 
router.get('/users/:id',getUserPosts)


module.exports = router