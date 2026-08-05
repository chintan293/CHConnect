import express from "express";
import {
    getConversationsForSidebar,
    getMessages,
    getUsersForSidebar,
    sendMessage,
    markMessagesAsRead,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.get("/:id", getMessages);
router.put("/read/:id", markMessagesAsRead);
router.post("/send/:id", upload.single("media"), sendMessage);
//todo: show this in the frontend



export default router;