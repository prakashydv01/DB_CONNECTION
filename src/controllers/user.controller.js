import { asynchandler } from "../utils/assyncHandler.js";
import { apierror } from "../utils/apiError.js";

import {uploadoncloudinary} from "../utils/cloudinary.js"
import { apiresponse } from "../utils/apiresponse.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefershToken= async (userId)=>
    {

    try {
        const user = await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refershToken= user.generateRefreshToken()
        user.refershToken = refershToken
       await user.save({ validateBeforeSave: false })
       return { accessToken, refershToken }
        
    } catch (error) {
        throw new apierror(505, "something went wrong while generating acess and refersh token")
        
    }
}

const registerUser = asynchandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apierror(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apierror(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    

    if (!avatarLocalPath) {
        throw new apierror(400, "Avatar file is required")
    }

    const avatar = await uploadoncloudinary(avatarLocalPath)
    const coverImage = await uploadoncloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new apierror(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username : username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apierror(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiresponse(200, createdUser, "User registered Successfully")
    )

} )
const loginUser = asynchandler (async(req,res)=>{
    //req body ->data
    // check username and email
    // find user
    //check password
    // access token and refresh token
    //send cookies

    const {username, email, password}= req.body

    if(!(username || email)){
        throw new apierror(400, "username or email is required")
    }
        const user =await User.findOne({
        $or: [{username}, {email}]
    })
    if (!user) {
        throw new apierror (404, "the user is not registered")   
    }
    const isPasswordvalid= await user.isPasswordCorrect(password)
    if (!isPasswordvalid) {
        throw new apierror (401, "password is incorrect")      
    }
    const { accessToken, refershToken}= await generateAccessAndRefershToken(user.id)

   const loggendUser= await User.findById(user._id).
   select("-password -refreshToken")

   const options ={
                httpOnly: true,
                secure: true
   }
   return res.status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refrehToken", refershToken, options)
   .json(
        new apiresponse(
                200,
                {
                    user: loggendUser, accessToken, refershToken
                },
                "user loggend sucessfully"
        )
   )

})
const logoutUser = asynchandler (async(req, res)=>{
           await  User.findByIdAndUpdate(
                req.user._id,
                {
                    $set:{
                        refershToken: undefined
                    } 
                },
                {
                    new: true
                }
            )
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refrehToken", options)
        .json(new apiresponse(200, {}, "user logged out"))
             
})
const options ={
    httpOnly: true,
    secure: true
}

const refershAccessToken = asynchandler(async(req, res)=>{
    const incomingRefreshToken = req.cookies.refershToken || req.body.refershToken

    if (!refershAccessToken) {
        throw new apierror(401, "unauthorized request")
    }
    try {
        const decodedToken= jwt.verify(
            incomingRefreshToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new apierror(401, "invalid request token")
        }
        if (incomingRefreshToken !== user?.refershToken) {
            throw new apierror(401, " redresh token is expired or used")
        }
        const options={
            httpOnly: true,
            secure: true
        }
        const {accessToken, newrefershToken}= await generateAccessAndRefershToken(user?._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefershToken, options )
        .json(
            new apiresponse(
                200,
                {accessToken, refershToken: newrefershToken},
                "refresh Token Refreshed"
            )
        )
    } catch (error) {
        throw new apierror(401, error?.message || "invalid refresh token")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refershAccessToken
}