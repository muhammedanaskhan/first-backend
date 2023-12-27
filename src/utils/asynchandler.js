const asyncHandler = (requestHandler) => {

    (req, res, next) => {

        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))

    }
}

export {asyncHandler}

const asyncHandlerTwo = (fn) => async(req, res, next) => { // wrapper function
    try{
        await fn(req, res, next)
    }catch(err){
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}