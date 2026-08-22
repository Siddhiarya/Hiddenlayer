const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create a notification for a specific user
 * @param {string|ObjectId} userId
 * @param {string} title
 * @param {string} message
 * @param {string} type
 * @param {string} [link]
 */
const createNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
    return notification;
  } catch (error) {
    console.error(`[NotificationService] Error creating notification for user ${userId}:`, error.message);
    return null;
  }
};

/**
 * Send notification to all HR officers and Admins
 * @param {string} title
 * @param {string} message
 * @param {string} type
 * @param {string} [link]
 */
const notifyAdmins = async (title, message, type = 'system', link = '') => {
  try {
    const adminsAndHR = await User.find({ role: { $in: ['hr', 'admin'] } }).select('_id');
    if (!adminsAndHR.length) return [];

    const notifications = adminsAndHR.map((admin) => ({
      user: admin._id,
      title,
      message,
      type,
      link,
    }));

    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('[NotificationService] Error sending notifications to admins:', error.message);
    return [];
  }
};

module.exports = {
  createNotification,
  notifyAdmins,
};
