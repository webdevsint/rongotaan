const express = require("express");
const { nanoid } = require("nanoid");
const { phone } = require("phone");
const path = require("path");
const fs = require("fs");
const { console } = require("inspector");
require("dotenv").config();
const rateLimit = require("express-rate-limit");

const key = process.env.API_KEY;

const router = express.Router();

const postRequestCounts = new Map();
const blockedIPs = new Set();

const overallPostRequestLimiter = (req, res, next) => {
  const clientIP = req.ip;

  if (blockedIPs.has(clientIP)) {
    console.warn(`Blocked (overall limit) request from IP: ${clientIP}`);
    return res
      .status(403)
      .send("Your IP has been blocked due to excessive registration attempts.");
  }

  if (req.method === "POST" && req.path === "/register") {
    const currentCount = postRequestCounts.get(clientIP) || 0;
    postRequestCounts.set(clientIP, currentCount + 1);

    if (currentCount + 1 > 10) {
      console.warn(
        `Blocking IP ${clientIP} due to exceeding 20 registration attempts.`
      );
      blockedIPs.add(clientIP);
      postRequestCounts.delete(clientIP);
      return res
        .status(429)
        .send(
          "Too many registration attempts from this IP. Your IP has been temporarily blocked."
        );
    }
  }

  next();
};

// Rate limiter for the /register route (max 1 POST requests per minute)
const registerRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 2, // Limit each IP to 1 requests per windowMs
  message:
    "Too many registration attempts from this IP, please try again after a minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

function saveData(payload) {
  let data = require("../data.json");
  data.push(payload);
  fs.writeFileSync(path.resolve("./data.json"), JSON.stringify(data));
}

function findIndexById(array, id) {
  return array.findIndex((obj) => obj.id === id);
}

function getCurrentDateFormatted() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();

  return `${day}-${month}-${year}`;
}

function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return regex.test(email);
}

router.use(overallPostRequestLimiter); // Apply the overall POST request limiter

router.get("/tokens", (req, res) => {
  if (req.query.key === key) {
    const data = require("../data.json");
    res.json(data);
  } else res.json({ message: "Invalid API Key!" });
});

router.get("/backup", (req, res) => {
  if (req.query.key === key) {
    res.download(
      path.resolve("./data.json"),
      `${getCurrentDateFormatted()}.json`
    );
  } else res.json({ message: "Invalid API Key!" });
});

router.get("/token/:id", (req, res) => {
  if (req.query.key === key) {
    const data = require("../data.json");
    const token = data.filter((token) => token.id === req.params.id);
    if (token.length > 0) {
      res.json(token[0]);
    } else res.json({ message: "Token not found!" });
  } else res.json({ message: "Invalid API Key!" });
});

router.delete("/token/:id", (req, res) => {
  if (req.query.key === key) {
    let data = require("../data.json");
    const id = req.params.id;
    const index = findIndexById(data, id);
    data.splice(index, 1);
    fs.writeFileSync(path.resolve("./data.json"), JSON.stringify(data));
    res.json({ message: "Token Deleted!" });
  } else res.json({ message: "Invalid API Key!" });
});

router.post("/register", registerRateLimiter, (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const contact = req.body.contact;
  const day = req.body.day;
  const transactionID = req.body.transactionID;

  function hasSpecialCharacters(inputValue) {
    const specialCharRegex = /[^a-zA-Z0-9\s]/g;
    return specialCharRegex.test(inputValue);
  }

  if (hasSpecialCharacters(name) || hasSpecialCharacters(transactionID)) {
    res.redirect("/registration-failed");
  } else {
    if (validateEmail(email)) {
      if (phone(contact, { country: "BD" }).isValid) {
        const payload = {
          id: nanoid(8),
          name,
          email,
          contact,
          day,
          receivable:
            day === "15th & 16th April, 2025" ? "480 Taka" : "240 Taka",
          transactionID,
          approved: false,
        };

        // saveData(payload);
        res.redirect("/register-success");
      } else {
        res.redirect("/registration-failed");
      }
    } else {
      res.redirect("/registration-failed");
    }
  }
});

router.post("/approve/:id", (req, res) => {
  if (req.query.key === key) {
    const id = req.params.id;
    const data = require("../data.json");
    const index = findIndexById(data, id);
    if (index > -1) {
      data[index].approved = true;
      fs.writeFileSync(path.resolve("./data.json"), JSON.stringify(data));
      res.json({ message: "Token verified!" });
    } else res.json({ message: "Token not found!" });
  } else res.json({ message: "Invalid API Key!" });
});

module.exports = router;
