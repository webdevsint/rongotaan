const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.resolve("./views/admin/tokens.html"));
  } else {
    res.redirect("/login");
  }
});

router.get("/register", (req, res) => {
  if (req.session.user) {
    res.sendFile(path.resolve("./views/register.html"));
  } else {
    res.redirect("/login");
  }
});

router.get('/generate', (req, res) => {
  if (req.session.user) {
    res.sendFile(path.resolve("./views/admin/generate.html"));
  } else {
    res.redirect("/login");
  }
})

module.exports = router;
