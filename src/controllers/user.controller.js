import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import uploadOnCloudinary from '../utils/fileUpload.js'
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Some went wrong while generatin Refresh & Access Token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    // get user details from user
    const { fullName, email, username, password } = req.body
    console.log("email", email)

    // validate inputs
    if (
        [fullName, email, username, password].some((field) => {
            field?.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are required")
    }


    // check if user already exists..(using username/email)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email/username exists already")
    }


    // check required files (avatar)
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) throw new ApiError(400), "Avatar required"


    //upload to cloudinary (avatar)
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if (!avatar) throw new ApiError(400, "Avatar not uploaded")

    // create user object, push to db
    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) throw new ApiError(500, "something went wrong while registering user")

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    // get login details from user
    // validate email / username
    // identify from existing db uing unique identifier
    // check password

    const { email, username, password } = req.body

    if (!username || !email) {
        throw new ApiError(400, 'username/email is required')
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "user doesn't exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(404, "Invalid password")
    }

    // access and refresh token
    // send cookie
    // give 

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    // above user object's refreshToken is empty as its not yet updated
    // with currently generated one.

    const loggedInUser = User.findById(user._id).select("-password -refreshToken")

    //send cookies

    const options = {
        httpOnly: true,
        secure: true // these cookies'd only be modifieble from server
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {

    // reset refresh token

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

     // clear cookies

     const options = {
        httpOnly: true,
        secure: true
     }

     return res
     .status(200)
     .clearCookie("accessToken", options)
     .clearCookie("refreshToken", options)
     .json(new ApiResponse(200, {}, "User Logged Out"))


})

export { registerUser, loginUser, logoutUser }