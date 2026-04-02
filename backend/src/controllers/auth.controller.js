const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// ── POST /api/auth/signup ────────────────────────────────────
const signup = async (req, res) => {
  try {
    console.log("Received signup request with body:", req.body);
    const { fullName, email, password, confirmPassword } = req.body;
    console.log("Signup request:", { fullName, email });

    // Basic validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email is already registered." });
    }

    const user = await User.create({ fullName, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {

      console.log("this is the err",error) ; 
    // Mongoose duplicate key
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email is already registered." });
    }
    // Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    const _os = require("os"); require("fs").appendFileSync(_os.tmpdir() + "/signup_err.txt", JSON.stringify({ msg: error.message, name: error.name, code: error.code, stack: error.stack?.split("\n")[0] }) + "\n");
   
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    // Explicitly select password (it is excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      token,
      user: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

// ── GET /api/auth/profile ────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: {
        id:        user._id,
        fullName:  user.fullName,
        email:     user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

module.exports = { signup, login, getProfile };
