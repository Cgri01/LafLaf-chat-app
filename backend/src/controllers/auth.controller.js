import react from "react";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js"


// SIGNUP CONTROLLER
export const signup = async (req, res) => {
    const{fullName , email , password} = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please fill in all fields!!!"})
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters!"});
        }

        const user = await User.findOne({email});

        if (user) {
            return res.status(400).json({ message: "Email already exists!!!"})
        }
        //HASH THE PASSWORD
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password , salt);

        const newUser = new User({
            fullName : fullName,
            email : email,
            password : hashedPassword
        })

        if (newUser) {
            // Generate JWT token 
            generateToken( newUser._id , res); //Mongodb'de her documentin bir _id alanı var
            await newUser.save();

            res.status(201).json( {
                _id : newUser._id,
                fullName : newUser.fullName,
                email : newUser.email,
                profilePicture : newUser.profilePicture
            })
        } else {
            return res.status(400).json({ message: "Invalid user data!!!"})
        }
        
    } catch (error) {
        console.log("Error in signup controller: " , error);
        res.status(500).json({ message: "Internal server error!!!"})
    }
};


// LOGIN CONTROLLER
export const login = async (req, res) => {

    const { email , password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!"})
        }

         const isPasswordCorrect= await bcrypt.compare(password , user.password);
         if (!isPasswordCorrect) {
            return res.status(400).json({ message : "Invalid credentials!"})
         }
         
         // If the password is correct , now we can generate the JWT token

         generateToken(user._id , res);

         res.status(200).json({
            id : user._id,
            fullName : user.fullName,
            email : user.email,
            profilePicture : user.profilePicture
         })
        
    } catch (error) {
        console.log("Error in login controller: " , error.message);
        res.status(500).json({ message: "Internal server error!!!"})
    }

};

// LOGOUT CONTROLLER
export const logout = (req, res) => {

    try {
        res.cookie("jwt" , "" , {maxAge : 0})
        res.status(200).json({ message: "Logged out successfully"})
    } catch (error) {
        console.log("Error in logout controller: " , error.message);
        res.status(500).json({ message: "Internal server error!"})
    }
};

// UPDATE PROFILE CONTROLLER
export const updateProfile = async (req , res) => {
    try {
        
        const {profilePicture} = req.body;
        const userId = req.user._id; // protectRoute middleware'inde req.user objesine user bilgilerini atamıştık. oradan userId'ye erişebiliriz.

        if (!profilePicture) {
            return res.status(400).json({ message : "Profile picture is required!"})
        }

        const uploadedResponse = await cloudinary.uploader.upload(profilePicture);
        const updatedUser = await User.findByIdAndUpdate( userId , {profilePicture : uploadedResponse.secure_url} , {new : true});

        res.status(200).json(updatedUser);



    } catch (error) {
        console.log("Error in updateProfile controller: " , error.message);
        res.status(500).json({ message : "Internal server error!"})
    }
};

export const checkAuth = async (req , res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller: " , error.message);
        res.status(500).json({ message : "Internal server error!"})
    }
}