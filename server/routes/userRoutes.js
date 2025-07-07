import express from "express";
import { checkAuth, getUserByEmail, login, signup, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";
import User from "../models/User.js";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);

userRouter.get("/find-by-email", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email }).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


userRouter.get("/users", protectRoute, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


export default userRouter;