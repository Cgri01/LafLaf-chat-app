import jwt from "jsonwebtoken"  

export const generateToken = (userId , res) => {

    const token = jwt.sign( {userId} , process.env.JWT_SECRET , {
        expiresIn : "1h"
    })

    res.cookie("jwt" , token , { //Tokenın adın jwts
        maxAge : 7 * 24 * 60 * 60 * 1000, // 7 gün
        httpOnly : true,
        sameSite : "strict", // CSRF saldırılarına karşı koruma sağlar.
        secure : process.env.NODE_ENV !== "development" // sadece production ortamında secure cookie kullanılır.
    })

    return token;
}