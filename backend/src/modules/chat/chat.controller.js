const chatService = require('./chat.service');

exports.send = async (req, res) => {
  try {
    const { message, sessionId, lessonId, subject, performanceLevel } = req.body;
    const userId = req.user.id; // Lấy từ middleware authenticate
    if (!message || !sessionId) {
      return res.status(400).json({ error: "Thiếu thông tin tin nhắn hoặc sessionId" });
    }
    const result = await chatService.sendMessage({ 
      userId, 
      message, 
      sessionId, 
      lessonId,
      subject,
      performanceLevel
    });
    res.json(result);
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi xử lý Chat" });
  }
};
