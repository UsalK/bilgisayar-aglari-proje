const jwt = require("jsonwebtoken");
const User = require("../models/newUser");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Baton", async (err, decodedToken) => {
      if (err) {
        console.log("JWT doğrulama hatası:", err.message);
        res.redirect("/login");  // JWT hatası varsa login sayfasına yönlendir
      } else {
        try {
          const user = await User.findById(decodedToken.id);
          res.locals.user = user; // Kullanıcı bilgilerini yerel değişkene ata
          
          next();
        } catch (error) {
          console.log("Kullanıcı bulunamadı:", error);
          res.redirect("/login");
        }
      }
    });
  } else {
    res.redirect("/login"); // Token yoksa login sayfasına yönlendir
  }
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "Baton", async (err, decodedToken) => {
      if (err) {
        res.locals.user = null;
        next();
      } else {
        const user = await User.findById(decodedToken.id);
        res.locals.user = user;
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};

module.exports = { requireAuth, checkUser };
