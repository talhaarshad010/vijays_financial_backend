const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      require: true,
    },
    businessType: {
      type: String,
    },
    registerAddress: {
      type: String,
    },
    email: {
      type: String,
      require: true,
    },
    phoneNumber: {
      type: Number,
      require: true,
    },
    NtnNumber: {
      type: Number,
      require: true,
    },
    salesTaxNumber: {
      type: Number,
    },

    country: {
      type: String,
      require: true,
    },
    province: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    website: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("company", companySchema);
