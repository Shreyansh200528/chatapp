
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js";
import mongoose from 'mongoose';
import {io,userSocketMap} from "../server.js"
const { Promise } = mongoose;



// Get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where the user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: userId },
        { receiverId: userId }
      ]
    });

    const userMap = {};
    const unseenMessages = {};

    messages.forEach((msg) => {
      const otherUserId =
        msg.senderId.toString() === userId.toString()
          ? msg.receiverId.toString()
          : msg.senderId.toString();

      userMap[otherUserId] = true;

      // Count unseen messages sent *to* the current user
      if (
        msg.receiverId.toString() === userId.toString() &&
        !msg.seen
      ) {
        unseenMessages[otherUserId] = (unseenMessages[otherUserId] || 0) + 1;
      }
    });

    const userIds = Object.keys(userMap);

    const users = await User.find({ _id: { $in: userIds } }).select("-password");

    res.json({
      success: true,
      users,
      unseenMessages
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Get all messages for selected user
export const getMessages = async (req, res) =>{
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages})


    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// api to mark message as seen using message id
export const markMessageAsSeen = async (req, res)=>{
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true})
        res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// Send message to selected user
export const sendMessage = async (req, res) =>{
    try {
        const {text, image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url;
        }
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // Emit the new message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.json({success: true, newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}