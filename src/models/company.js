const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    businessType: String,
    registerAddress: String,
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    NtnNumber: {
      type: Number,
      required: true,
    },
    salesTaxNumber: Number,
    country: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    website: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("company", companySchema);
