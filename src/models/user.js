const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      default: null,
    },
    token: {
      type: String,
      default: null,
    },
    companies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company", // Stores multiple company IDs
      },
    ],
    otp: {
      type: String,
      default: null,
    },
    expiryCode: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
