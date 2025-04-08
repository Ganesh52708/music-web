// Show the appropriate form
function showForm(formType) {
    // Hide all forms
    document.querySelectorAll(".form-section").forEach((form) => {
      form.classList.remove("active")
    })
  
    // Show the selected form
    switch (formType) {
      case "login":
        document.getElementById("loginForm").classList.add("active")
        break
      case "signup":
        document.getElementById("signupForm").classList.add("active")
        break
      case "otp":
        document.getElementById("otpForm").classList.add("active")
        break
      case "forgot":
        document.getElementById("forgotPasswordForm").classList.add("active")
        break
      case "reset":
        document.getElementById("resetPasswordForm").classList.add("active")
        break
    }
  
    // Add a nice transition effect
    const formContainer = document.querySelector(".form-container")
    formContainer.style.animation = "none"
    setTimeout(() => {
      formContainer.style.animation = "fadeIn 0.5s ease-in-out"
    }, 10)
  }
  
  // Show OTP form and set email
  function showOTPForm(email) {
    document.getElementById("otpEmail").value = email
    showForm("otp")
  }
  
  // Show Reset Password form and set email
  function showResetForm(email) {
    document.getElementById("resetEmail").value = email
    showForm("reset")
  }
  
  // Handle signup form submission
  async function handleSignup(event) {
    event.preventDefault()
  
    // Get form data
    const name = document.getElementById("name").value
    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value
  
    // Validate inputs
    if (!name || !email || !password) {
      showNotification("All fields are required", "error")
      return
    }
  
    // Show loading state
    const submitButton = document.getElementById("signupButton")
    const loader = document.getElementById("signupLoader")
    submitButton.disabled = true
    loader.style.display = "block"
  
    try {
      const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        showNotification("OTP has been sent to your email", "success")
        showOTPForm(email)
      } else {
        showNotification(data.error || "Error during signup", "error")
      }
    } catch (error) {
      console.error("Signup error:", error)
      showNotification("Error connecting to server. Please try again later.", "error")
    } finally {
      submitButton.disabled = false
      loader.style.display = "none"
    }
  }
  
  // Handle forgot password form submission
  async function handleForgotPassword(event) {
    event.preventDefault()
  
    // Get form data
    const email = document.getElementById("forgotEmail").value
  
    // Validate input
    if (!email) {
      showNotification("Email is required", "error")
      return
    }
  
    // Show loading state
    const submitButton = document.getElementById("forgotPasswordButton")
    const loader = document.getElementById("forgotPasswordLoader")
    submitButton.disabled = true
    loader.style.display = "block"
  
    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
  
      const data = await response.json()
  
      if (response.ok) {
        showNotification("Password reset token has been sent to your email", "success")
        showResetForm(email)
      } else {
        showNotification(data.error || "Error sending reset token", "error")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      showNotification("Error connecting to server. Please try again later.", "error")
    } finally {
      submitButton.disabled = false
      loader.style.display = "none"
    }
  }
  
  // Function to resend OTP
  function resendOTP() {
    const email = document.getElementById("otpEmail").value
  
    if (!email) {
      showNotification("Email information is missing", "error")
      return
    }
  
    // Resubmit the signup form with the same email
    fetch("/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, resendOtp: true }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          showNotification("OTP has been resent to your email", "success")
        } else {
          showNotification(data.error || "Error resending OTP", "error")
        }
      })
      .catch((error) => {
        console.error("Resend OTP error:", error)
        showNotification("Error connecting to server", "error")
      })
  }
  
  // Show notification
  function showNotification(message, type) {
    // Check if notification container exists, if not create it
    let notificationContainer = document.querySelector(".notification-container")
  
    if (!notificationContainer) {
      notificationContainer = document.createElement("div")
      notificationContainer.className = "notification-container"
      document.body.appendChild(notificationContainer)
    }
  
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.innerHTML = `
          <div class="notification-content">
              <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
              <span>${message}</span>
          </div>
      `
  
    // Add to container
    notificationContainer.appendChild(notification)
  
    // Remove after 5 seconds
    setTimeout(() => {
      notification.classList.add("hide")
      setTimeout(() => {
        notification.remove()
      }, 500)
    }, 5000)
  }
  
  // Add notification styles
  const style = document.createElement("style")
  style.textContent = `
      .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
      }
      
      .notification {
          background-color: var(--surface-color);
          color: var(--text-color);
          border-radius: 10px;
          padding: 15px;
          margin-bottom: 10px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          transform: translateX(100%);
          animation: slideIn 0.5s forwards;
          border-left: 4px solid var(--primary-color);
          min-width: 300px;
      }
      
      .notification.success {
          border-left-color: var(--success-color);
      }
      
      .notification.error {
          border-left-color: var(--error-color);
      }
      
      .notification-content {
          display: flex;
          align-items: center;
      }
      
      .notification-content i {
          margin-right: 10px;
          font-size: 1.2rem;
      }
      
      .notification.success i {
          color: var(--success-color);
      }
      
      .notification.error i {
          color: var(--error-color);
      }
      
      .notification.hide {
          animation: slideOut 0.5s forwards;
      }
      
      @keyframes slideIn {
          to {
              transform: translateX(0);
          }
      }
      
      @keyframes slideOut {
          to {
              transform: translateX(100%);
          }
      }
      
      @keyframes fadeIn {
          from {
              opacity: 0;
              transform: translateY(-10px);
          }
          to {
              opacity: 1;
              transform: translateY(0);
          }
      }
  `
  document.head.appendChild(style)
  
  // Initialize the page - show login form by default
  document.addEventListener("DOMContentLoaded", () => {
    showForm("login")
  
    // Add audio equalizer animation effect
    const equalizer = document.querySelector(".equalizer")
    if (equalizer) {
      setInterval(() => {
        const bars = equalizer.querySelectorAll(".bar")
        bars.forEach((bar) => {
          const randomHeight = Math.floor(Math.random() * 20) + 10
          bar.style.height = `${randomHeight}px`
        })
      }, 100)
    }
  })
  