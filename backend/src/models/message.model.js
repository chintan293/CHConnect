import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    video: {
        type: String,
    },
    audio: {
        type: String,
    },
    fileUrl: {
        type: String,
    },
    fileName: {
        type: String,
    },
    fileSize: {
        type: Number,
    },
    mimeType: {
        type: String,
    },
    clientId: {
        type: String,
        unique: true,
        sparse: true,
    },
    status: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent",
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    },
    { timestamps: true },
);

const Message = mongoose.model("Message", messageSchema);

export default Message;