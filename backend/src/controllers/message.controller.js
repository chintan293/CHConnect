import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-clerkId");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      // 1. Keep only the messages I sent or received.
      { $match: { $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] } },
      // 2. Collapse them into one row per chat partner, noting our latest message time.
      {
        $group: {
          // The partner is the other person on the message (not me).
          _id: { $cond: [{ $eq: ["$senderId", loggedInUserId] }, "$receiverId", "$senderId"] },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      // 3. Put the most recent conversation at the top.
      { $sort: { lastMessageAt: -1 } },
      // 4. Look up each partner's user profile (comes back as an array).
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      // 5. Pull that profile out of the array and make it the document.
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      // 6. Hide the private clerkId field from the result.
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text, clientId } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    // Check for duplicate message if clientId is provided
    if (clientId) {
      const existingMessage = await Message.findOne({ clientId });
      if (existingMessage) {
        return res.status(200).json(existingMessage); // Return existing to prevent duplicate
      }
    }

    let imageUrl;
    let videoUrl;
    let audioUrl;
    let fileUrl;
    let fileName;
    let fileSize;
    let mimeType;

    if (req.file) {
      if (!hasImageKitConfig()) {
        return res.status(400).json({ message: "Media upload is not configured on server" });
      }

      try {
        const url = await uploadChatMedia(req.file);
        
        const isImage = req.file.mimetype.startsWith("image/");
        const isVideo = req.file.mimetype.startsWith("video/");
        const isAudio = req.file.mimetype.startsWith("audio/");

        if (isVideo) {
          videoUrl = url;
        } else if (isAudio) {
          audioUrl = url;
        } else if (isImage) {
          imageUrl = url;
        } else {
          fileUrl = url;
        }
        
        fileName = req.file.originalname;
        fileSize = req.file.size;
        mimeType = req.file.mimetype;
        
      } catch (uploadErr) {
        console.error("Media upload error:", uploadErr);
        return res.status(400).json({ message: uploadErr.message || "Failed to upload media file" });
      }
    }

    const receiverSocketId = getReceiverSocketId(receiverId);
    const initialStatus = receiverSocketId ? "delivered" : "sent";

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      video: videoUrl,
      audio: audioUrl,
      fileUrl,
      fileName,
      fileSize,
      mimeType,
      clientId,
      status: initialStatus,
      isRead: false,
    });

    await newMessage.save();

    // Send realtime message to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("========== SEND MESSAGE ERROR ==========");
    console.error(error);
    // If it's a duplicate key error for clientId, fetch and return the message safely
    if (error.code === 11000 && error.keyPattern && error.keyPattern.clientId) {
      const existingMessage = await Message.findOne({ clientId: req.body.clientId });
      if (existingMessage) {
        return res.status(200).json(existingMessage);
      }
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function markMessagesAsRead(req, res) {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true, status: "read" } }
    );

    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesRead", { readerId: receiverId, senderId });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}