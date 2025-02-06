const User = require("../../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../../utils/helperFunc");
const company = require("../../models/company");

const userSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate JWT Token
    // const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    //   expiresIn: "1h",
    // });

    // Create new user with token
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      token,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully!",
      // token,
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
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

const setMode = async (req, res) => {
  try {
    const { userId } = req.user; // Get user ID from token
    const { mode } = req.body;

    // Validate input
    if (!mode || (mode !== "Pro" && mode !== "Normal")) {
      return res
        .status(400)
        .json({ message: "Invalid mode. Choose 'Pro' or 'Basic'." });
    }

    // Find the user and update mode
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    user.mode = mode; // Update mode
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
    const { userId } = req.user; // Get user ID from token
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

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Check if user mode is "Pro"
    if (user.mode !== "Pro") {
      return res
        .status(403)
        .json({ message: "Only Pro users can create a company!" });
    }

    // Create new company
    const newCompany = new company({
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

    // Save company ID in the user's companies array
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

module.exports = {
  userSignup,
  userSignin,
  setMode,
  createCompany,
};
