const express = require("express");
const { nanoid } = require("nanoid");
const { phone } = require("phone");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const key = process.env.API_KEY;

const router = express.Router();

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

router.get("/tokens", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
    if (req.query.key === key) {
      const data = require("../data.json");

      res.json(data);
    } else res.json({ message: "Invalid API Key!" });
  } else res.sendStatus(403);
});

router.get("/backup", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
    if (req.query.key === key) {
      res.download(
        path.resolve("./data.json"),
        `${getCurrentDateFormatted()}.json`
      );
    } else res.json({ message: "Invalid API Key!" });
  } else res.sendStatus(403);
});

router.get("/token/:id", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
    if (req.query.key === key) {
      const data = require("../data.json");
      const token = data.filter((token) => token.id === req.params.id);

      if (token.length > 0) {
        res.json(token[0]);
      } else res.json({ message: "Token not found!" });
    } else res.json({ message: "Invalid API Key!" });
  } else res.sendStatus(403);
});

router.delete("/token/:id", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
    if (req.query.key === key) {
      let data = require("../data.json");
      const id = req.params.id;

      const index = findIndexById(data, id);

      data.splice(index, 1);

      fs.writeFileSync(path.resolve("./data.json"), JSON.stringify(data));

      res.json({ message: "Token Deleted!" });
    } else res.json({ message: "Invalid API Key!" });
  } else res.sendStatus(403);
});

router.post("/register", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
    const name = req.body.name;
    const email = req.body.email;
    const contact = req.body.contact;
    const transactionID = req.body.transactionID;

    if (validateEmail(email)) {
      if (phone(contact, { country: "BD" }).isValid) {
        const payload = {
          id: nanoid(8),
          name,
          email,
          contact,
          transactionID,
          approved: false,
        };

        saveData(payload);

        res.redirect("/register-success");
      } else {
        res.json({ message: "Invalid Phone Number!" });
      }
    } else res.json({ message: "Invalid Email Address!" });
  } else res.sendStatus(403);
});

router.post("/approve/:id", (req, res) => {
  let ip = req.ip;

  if (ip === "::1") {
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
  } else res.sendStatus(403);
});

module.exports = router;
