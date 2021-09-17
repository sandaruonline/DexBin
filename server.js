const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
const { MongoDBURI } = require("./config.json");

const Document = require("./models/Document");
mongoose.connect(MongoDBURI, { useUnifiedTopology: true, useNewUrlParser: true }).then(() => console.log("Connected to MongoDB"));

const pasteRateLimiter = rateLimit({
    windowMs: 10000,
    max: 2,
    message: "You can only create 2 pastes within 10 seconds. Please try again later."
});

app.get("/", (req, res) => {

    const code = `Welcome to DexBin! the easiest and prettiest way to share code.

Use the button in the top right corner to create a new paste to share with others.

Made with ❤ by Sandaru Fernando <hello@sandaru.dev>`
    
    res.render("code-display", { code, language: "plaintext" });
});

app.get("/new", (req, res) => {
    res.render("new")
});

app.post("/save", pasteRateLimiter, async (req, res) => {
    const value = req.body.value
    try {
        const document = await Document.create({ value });
        res.redirect(`/${document.id}`);
    } catch (e) {
        res.render("new", { value });
    }
});

app.get("/:id/duplicate", async (req, res) => {
    const id = req.params.id;

    try {
        const document = await Document.findById(id);

        res.render("new", { value: document.value });
    } catch (e) {
        res.redirect(`${id}`);
    }
});

app.get("/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const document = await Document.findById(id);

        res.render("code-display", { code: document.value, id });
    } catch (e) {
        res.redirect("/");
    }
});

app.get("/:id/raw", async (req, res) => {
    const id = req.params.id;

    try {
        const document = await Document.findById(id);

        res.setHeader('Content-Type', 'text/plain');
        res.send(document.value);
    } catch (e) {
        res.redirect(`${id}`);
    }
});

app.get('*', (req, res) => {
    res.redirect("/");
});

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
