const express = require("express")
const mongoose = require("mongoose")
const path = require("path")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const bodyParser = require("body-parser")
const session = require("express-session")
const port = 4000

const app = express()
app.use(express.static(__dirname))
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.static("public"))
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  }),
)

mongoose
  .connect(
    "mongodb+srv://ganeshyadavudl:ganesh2005@ganesh.pgf9yg2.mongodb.net/?retryWrites=true&w=majority&appName=Ganesh",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  )
  .catch((err) => {
    console.error("MongoDB connection error:", err)
  })

const db = mongoose.connection
db.once("open", () => {
  console.log("MongoDB connection successful")
})

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  otp: String,
  otpExpiration: Date,
  isActive: Boolean,
  resetToken: String,
  resetTokenExpiration: Date,
})

const Users = mongoose.model("Users", userSchema)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/index.html"))
})

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    const existingUser = await Users.findOne({ email })

    if (existingUser) {
      return res.status(400).json({ error: "You already have an account" })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString() // Generate a 6-digit OTP
    const otpExpiration = Date.now() + 3600000 // OTP valid for 1 hour

    const user = new Users({
      name,
      email,
      password,
      otp,
      otpExpiration,
      isActive: false,
    })

    await user.save()

    // Set up nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ganeshyadav.24@nshm.edu.in",
        pass: "hxpqlyjnggmzkczm",
      },
    })

    // Email content
    const mailOptions = {
      from: "ganeshyadav.24@nshm.edu.in",
      to: email,
      subject: "OTP Verification",
      text: `Your OTP for account verification is: ${otp}`,
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email error:", error)
        return res.status(500).json({ error: "Failed to send OTP email" })
      }
      console.log("Email sent: " + info.response)
      return res.status(200).json({ message: "OTP sent successfully" })
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({ error: "Server error during signup" })
  }
})

app.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body
    const user = await Users.findOne({
      email,
      otp,
      otpExpiration: { $gt: Date.now() },
    })

    if (user) {
      user.otp = undefined
      user.otpExpiration = undefined
      user.isActive = true
      await user.save()

      res.send(
        '<script>alert("OTP verified successfully. Your account is now active."); window.location.href = "/";</script>',
      )
    } else {
      res.send('<script>alert("Invalid or expired OTP"); window.location.href = "/";</script>')
    }
  } catch (error) {
    console.error("OTP verification error:", error)
    res.status(500).send('<script>alert("Server error during OTP verification"); window.location.href = "/";</script>')
  }
})

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await Users.findOne({ email })

    if (!user) {
      return res.send('<script>alert("No account found with this email"); window.location.href = "/";</script>')
    }

    if (user && user.password === password) {
      if (user.isActive) {
        req.session.user = user // Store user data in session
        res.redirect("/home.html") // Redirect to home page if login is successful
      } else {
        res.send('<script>alert("Please verify your account first"); window.location.href = "/";</script>')
      }
    } else {
      res.send('<script>alert("Your password is wrong"); window.location.href = "/";</script>')
    }
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).send('<script>alert("Server error during login"); window.location.href = "/";</script>')
  }
})

app.get("/logout", (req, res) => {
  // Clear the user session
  req.session.destroy((err) => {
    if (err) {
      console.log(err)
    } else {
      res.sendFile(path.join(__dirname, "../public/index.html")) // Redirect to the index page after logout
    }
  })
})

app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body
    const user = await Users.findOne({ email })

    if (user) {
      const token = crypto.randomBytes(20).toString("hex")
      user.resetToken = token
      user.resetTokenExpiration = Date.now() + 3600000 // Token valid for 1 hour
      await user.save()

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "ganeshyadav.24@nshm.edu.in",
          pass: "hxpqlyjnggmzkczm",
        },
      })

      const mailOptions = {
        from: "ganeshyadav.24@nshm.edu.in",
        to: email,
        subject: "Password Reset",
        text: `You requested a password reset. Use this token to reset your password: ${token}`,
      }

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email error:", error)
          return res.status(500).json({ error: "Failed to send reset email" })
        }
        console.log("Email sent: " + info.response)
        return res.status(200).json({ message: "Reset token sent successfully" })
      })
    } else {
      res.status(400).json({ error: "No account with that email found" })
    }
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Server error during password reset request" })
  }
})

app.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    const user = await Users.findOne({
      email,
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    })

    if (user) {
      user.password = newPassword
      user.resetToken = undefined
      user.resetTokenExpiration = undefined
      await user.save()

      res.send('<script>alert("Password has been reset successfully"); window.location.href = "/";</script>')
    } else {
      res.send('<script>alert("Invalid or expired token"); window.location.href = "/";</script>')
    }
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).send('<script>alert("Server error during password reset"); window.location.href = "/";</script>')
  }
})

app.get("/home", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/")
  }
  res.sendFile(path.join(__dirname, "/home.html"))
})

app.listen(port, () => {
  console.log("Server started on port", port)
})
