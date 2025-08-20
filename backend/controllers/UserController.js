import User from "../models/User.js";
import generateToken from "../helpers/generateToken.js";
import asynchandler from "express-async-handler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Token from "../models/Token.js";
import crypto from "node:crypto";
import hashToken from "../helpers/hashToken.js";
import sendEmail from "../helpers/sendEmail.js";
dotenv.config();

const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  path: "/",
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
  domain: process.env.COOKIE_DOMAIN || undefined,
};

export const registerUser = asynchandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.cookie("token", token, cookieOptions);

    if (user) {
        const { _id, name: nm, email: em, role, photo, bio, isVerified } = user;
        return res.status(201).json({ _id, name: nm, email: em, role, photo, bio, isVerified, token });
    }

    return res.status(400).json({ message: "Invalid user data" });
});

export const loginUser = asynchandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (!userExists) {
        return res.status(400).json({ message: "User does not exist, please register!" });
    }

    const isMatch = await bcrypt.compare(password, userExists.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(userExists._id);
    res.cookie("token", token, cookieOptions);

    const { _id, name, role, photo, bio, isVerified } = userExists;
    return res.status(200).json({ _id, name, email, role, photo, bio, isVerified, token });
});

export const logoutUser = asynchandler(async (req, res) => {
    res.clearCookie("token", { path: "/", sameSite: cookieOptions.sameSite, secure: cookieOptions.secure, domain: cookieOptions.domain });
    return res.status(200).json({ message: "User logged out successfully" });
});

export const getUser = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        return res.status(200).json(user);
    }
    return res.status(404).json({ message: "User not found" });
});

export const updateUser = asynchandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, photo } = req.body;
    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.photo = photo || user.photo;

    const updated = await user.save();
    return res.status(200).json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        photo: updated.photo,
        bio: updated.bio,
        isVerified: updated.isVerified,
    });
});

export const userLoginStatus = asynchandler(async (req, res) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(200).json({ loggedIn: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(200).json({ loggedIn: false });
        }
        return res.status(200).json({ loggedIn: true, user });
    } catch (err) {
        return res.status(200).json({ loggedIn: false });
    }
});

export const forgetPassword = asynchandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email });
    if (!user) {
        return res.status(400).json({ message: "User does not exist" });
    }

    let token = await Token.findOne({ userId: user._id });
    if (token) {
        await token.deleteOne();
    }

    const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;
    const hashedPasswordResetToken = hashToken(passwordResetToken);

    await new Token({
        userId: user._id,
        passwordResetToken: hashedPasswordResetToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60 * 60 * 1000,
    }).save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

    const subject = "Password Reset - Auth2";
    const send_to = user.email;
    const send_from = process.env.USER_EMAIL;
    const reply_to = "noreply@noreply.com";
    const template = "forgotPassword";
    const name = user.name;
    const url = resetLink;

    try {
        await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
        return res.json({ message: "Email sent" });
    } catch (error) {
        console.log("Error sending email: ", error);
        return res.status(500).json({ message: "Email could not be sent" });
    }
});

export const resetPassword = asynchandler(async (req, res) => {
    const { resetPasswordToken } = req.params;
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = hashToken(resetPasswordToken);
    const userToken = await Token.findOne({
        passwordResetToken: hashedToken,
        expiresAt: { $gt: Date.now() },
    });

    if (!userToken) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const user = await User.findById(userToken.userId);
    user.password = password;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
});

export const changePassword = asynchandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid password!" });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
});
