//404 routes
const notFound = (req,res,next)=>{
    const error = new Error(`Not found - ${req.originalUrl}`)
    next(error)
}

//Middle ware to handle Errors
const errorHandle = (error,req,res,next)=>{
    if(res.headerSent){
        return next(error)

    }
    res.status(error.code || 500).json({message:error.message || "An unknown error occured."})
}

module.exports ={notFound,errorHandle}