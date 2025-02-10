const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/helperFunc");
const company = require("../../models/company");

const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const userSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("djsjd", email, password);

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    user.token = token;
    await user.save();

    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mode: user.mode,
        companies: user.companies.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const setMode = async (req, res) => {
  try {
    const { userId } = req.user;
    const { mode } = req.body;

    if (!mode || (mode !== "Pro" && mode !== "Normal")) {
      return res
        .status(400)
        .json({ message: "Invalid mode. Choose 'Pro' or 'Basic'." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    user.mode = mode;
    await user.save();

    res.status(200).json({
      message: "User mode updated successfully!",
      mode: user.mode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const createCompany = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      companyName,
      businessType,
      registerAddress,
      email,
      phoneNumber,
      NtnNumber,
      salesTaxNumber,
      country,
      province,
      city,
      website,
    } = req.body;

    // Validate required fields
    if (
      !companyName ||
      !email ||
      !phoneNumber ||
      !NtnNumber ||
      !country ||
      !province ||
      !city
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields!" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.mode !== "Pro") {
      return res.status(200).json({
        message:
          "Company creation simulated. Upgrade to Pro to save it permanently.",
        company: {
          companyName,
          businessType,
          registerAddress,
          email,
          phoneNumber,
          NtnNumber,
          salesTaxNumber,
          country,
          province,
          city,
          website,
        },
      });
    }

    // Create new company
    const newCompany = new company({
      userId,
      companyName,
      businessType,
      registerAddress,
      email,
      phoneNumber,
      NtnNumber,
      salesTaxNumber,
      country,
      province,
      city,
      website,
    });

    await newCompany.save();

    // Store company ID in user's "companies" array
    user.companies.push(newCompany._id);
    await user.save();

    res.status(201).json({
      message: "Company created successfully!",
      company: newCompany,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getUserCompanies = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log("user id in ", userId);
    const user = await User.findById(userId).populate("companies");

    if (!user || user.companies.length === 0) {
      return res.status(404).json({ message: "No companies found!" });
    }

    res.status(200).json({
      message: "Companies fetched successfully!",
      companies: user.companies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Email is required",
      success: false,
    });
  }

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const { _id, name } = user;

    // Generate a random 4-digit OTP
    const randomString = "0123456789";
    let code = "";
    for (let i = 0; i < 4; i++) {
      code += randomString[Math.floor(Math.random() * randomString.length)];
    }

    console.log("OTP:", code);

    // Set expiry time for OTP (2 minutes)
    const expiryDate = new Date(Date.now() + 2 * 60 * 1000);

    // Update user with OTP and expiry time
    await User.updateOne(
      { _id },
      {
        $set: {
          otp: code,
          expiryCode: expiryDate,
        },
      }
    );

    // Email content
    const htmlEmail = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Code</title>
      </head>
      <body>
        <p>Dear ${name},</p>
        <p>Here is your verification code to reset your password. Use it within 2 minutes.</p>
        <p><strong>Verification Code:</strong> ${code}</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>Vijay Financial's support Support Team</p>
      </body>
      </html>
    `;

    // Send email
    const mailContent = {
      from: "talha@logicloopsolutions.net",
      to: email,
      subject: "Verification Code - Vijay Financial's",
      html: htmlEmail,
    };

    try {
      await sendEmail(mailContent);
      console.log(`OTP sent to: ${email}`);
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
        success: false,
        error: emailError.message,
      });
    }

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      data: { id: _id, email },
    });
  } catch (error) {
    console.error("Forget Password Error:", error);
    res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  }
};

// const verifyOtp = async (req, res) => {
//   const { email, otp } = req.body;

//   try {
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     if (!user.otp || !user.expiryCode) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP not generated, please request a new one",
//       });
//     }

//     const currentTime = new Date();

//     if (currentTime > user.expiryCode) {
//       return res.status(400).json({
//         success: false,
//         message: "OTP has expired, please request a new one",
//       });
//     }

//     if (user.otp !== otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid OTP",
//       });
//     }

//     // Clear OTP after successful verification
//     await User.updateOne(
//       { _id: user._id },
//       { $set: { otp: null, expiryCode: null } }
//     );

//     return res.status(200).json({
//       success: true,
//       message: "OTP verified successfully",
//     });
//   } catch (error) {
//     console.error("OTP Verification Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "An error occurred during OTP verification",
//       error: error.message,
//     });
//   }
// };

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.expiryCode) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated, please request a new one",
      });
    }

    const currentTime = new Date();

    if (currentTime > user.expiryCode) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired, please request a new one",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Removed clearing of OTP and expiryCode, as per your request

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
      error: error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp || !user.expiryCode) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated, please request a new one",
      });
    }

    const currentTime = new Date();
    if (currentTime > new Date(user.expiryCode)) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired, please request a new one",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear OTP fields
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          otp: null,
          expiryCode: null,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the password",
      error: error.message,
    });
  }
};

module.exports = {
  userSignup,
  userSignin,
  setMode,
  createCompany,
  getUserCompanies,
  forgetPassword,
  verifyOtp,
  updatePassword,
};
