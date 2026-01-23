import Chat from '../models/Chat.js';
import Analysis from '../sentimentAnalysis/models/Analysis.js';
import Report from '../reports/models/Report.js';

// @desc    Create new chat
// @route   POST /api/chats
// @access  Private
export const createChat = async (req, res) => {
  try {
    const { platform = 'all', options = {} } = req.body;

    const chat = new Chat({
      user: req.user._id,
      title: 'New Chat',
      messages: [],
      platform,
      options
    });

    await chat.save();

    res.status(201).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all chats for user
// @route   GET /api/chats
// @access  Private
export const getChats = async (req, res) => {
  try {
    const { page = 1, limit = 20, archived = false } = req.query;

    const query = { 
      user: req.user._id,
      isArchived: archived === 'true'
    };

    const chats = await Chat.find(query)
      .select('title platform updatedAt createdAt isPinned messages')
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Chat.countDocuments(query);

    const transformedChats = chats.map(chat => {
      const lastUserMessage = [...chat.messages].reverse().find(m => m.type === 'user');
      return {
        _id: chat._id,
        title: chat.title,
        platform: chat.platform,
        messageCount: chat.messages.length,
        analysisCount: chat.messages.filter(m => m.type === 'ai').length,
        preview: lastUserMessage?.content || null,
        isPinned: chat.isPinned,
        updatedAt: chat.updatedAt,
        createdAt: chat.createdAt
      };
    });

    res.json({
      success: true,
      data: {
        chats: transformedChats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single chat with all messages
// @route   GET /api/chats/:id
// @access  Private
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add message to chat
// @route   POST /api/chats/:id/messages
// @access  Private
export const addMessage = async (req, res) => {
  try {
    const { type, content, query, analysisId } = req.body;

    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const message = {
      type,
      content,
      query: query || undefined,
      analysisId: analysisId || undefined,
      timestamp: new Date()
    };

    chat.messages.push(message);
    await chat.save();

    res.json({
      success: true,
      data: {
        message: chat.messages[chat.messages.length - 1],
        chatId: chat._id,
        title: chat.title
      }
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private
export const updateChat = async (req, res) => {
  try {
    const { title, platform, options, isPinned } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (platform !== undefined) updateData.platform = platform;
    if (options !== undefined) updateData.options = options;
    if (isPinned !== undefined) updateData.isPinned = isPinned;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updateData,
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private
export const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Collect all analysisIds from chat messages
    const analysisIds = chat.messages
      .filter(msg => msg.analysisId)
      .map(msg => msg.analysisId);

    if (analysisIds.length > 0) {
      // Find analyses that have reports (these should NOT be deleted)
      const reportsWithAnalysis = await Report.find({
        analysis: { $in: analysisIds },
        status: { $ne: 'deleted' }
      }).select('analysis');

      const analysisIdsWithReports = reportsWithAnalysis.map(report => report.analysis.toString());

      // Delete only analyses that don't have reports
      const analysisIdsToDelete = analysisIds.filter(
        id => !analysisIdsWithReports.includes(id.toString())
      );

      if (analysisIdsToDelete.length > 0) {
        await Analysis.deleteMany({
          _id: { $in: analysisIdsToDelete },
          user: req.user._id
        });
      }
    }

    // Delete the chat
    await Chat.findByIdAndDelete(chat._id);

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Archive chat
// @route   PUT /api/chats/:id/archive
// @access  Private
export const archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.isArchived = !chat.isArchived;
    await chat.save();

    res.json({
      success: true,
      data: { isArchived: chat.isArchived },
      message: chat.isArchived ? 'Chat archived' : 'Chat unarchived'
    });
  } catch (error) {
    console.error('Archive chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clear messages
// @route   DELETE /api/chats/:id/messages
// @access  Private
export const clearMessages = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    chat.messages = [];
    chat.title = 'New Chat';
    await chat.save();

    res.json({
      success: true,
      message: 'Messages cleared'
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};