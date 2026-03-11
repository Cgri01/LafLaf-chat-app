import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.status(401).json({ message : "Unauthorized - No token provided!"});
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message : "Unauthorized - Invalid token!"});
        }

        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message : "User not found!"});
        }

        req.user = user; // req.user objesine user bilgilerini atıyoruz ki diğer route'larda bu bilgilere erişebilelim.

        next(); // eğer her şey yolundaysa next() fonksiyonunu çağırarak bir sonraki middleware'e geçiyoruz. fonksşyonlar auth.route.js'deki belirttiğimiz fonksiyonlar.


    } catch (error) {
        console.log("Error in protectRoute middleware: " , error.message);
        res.status(500).json({ message : "Internal server error!"});
    }
}