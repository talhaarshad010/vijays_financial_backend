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

module.exports = {
  userSignup,
  userSignin,
  setMode,
  createCompany,
  getUserCompanies,
};
