const express = require("express");
const user_controlller = require("./user.controller");
const authMiddleware = require("../../config/auth");
const router = express.Router();
router.post("/userSignup", user_controlller.userSignup);
router.post("/userSignin", user_controlller.userSignin);
router.post("/ForgotPassword", user_controlller.forgetPassword);
router.post("/VerifyOtp", user_controlller.verifyOtp);
router.post("/UpdatePassword", user_controlller.updatePassword);
router.post("/setMode", authMiddleware, user_controlller.setMode);
router.post("/createCompany", authMiddleware, user_controlller.createCompany);
router.get("/getCompanies", authMiddleware, user_controlller.getUserCompanies);

module.exports = router;
