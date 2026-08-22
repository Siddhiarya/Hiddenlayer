const mongoose = require('mongoose');

const revokedTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: automatically deleted when expiresAt is reached
    },
  },
  {
    timestamps: true,
  }
);

const RevokedToken = mongoose.model('RevokedToken', revokedTokenSchema);

module.exports = RevokedToken;
