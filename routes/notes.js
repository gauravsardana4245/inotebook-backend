const express = require("express")
const router = express.Router();
const Note = require("../Models/Note")
const { body, validationResult } = require('express-validator');
const fetchuser = require("../middlewares/fetchuser")

// Fetching all  notes
router.get("/fetchallnotes", fetchuser, async (req, res) => {
    const note = await Note.find({ user: req.user.id })
    res.json(note);
})

// Add a new Note 
router.post("/addnote", fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be atleast 5 characters long').isLength({ min: 5 })

], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        let note = await Note.findOne({ title: req.body.title })
        if (note) {
            return res.status(400).json({ error: "Sorry a note with this title already exists" });
        }
        note = await Note.create({
            title: req.body.title,
            description: req.body.description,
            tag: req.body.tag,
            user: req.user.id
        })

        res.json({ note });
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
}
)

// Update an existing note
router.put("/updatenote/:id", fetchuser, async (req, res) => {
    let { title, description, tag } = req.body;
    try {

        // Create a new note object
        const newNote = {};
        if (title) { newNote.title = title }
        if (description) { newNote.description = description }
        if (tag) { newNote.tag = tag }

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(400).send("Note not found");
        }
        if (note.user.toString() != req.user.id) {
            return res.status(400).send("Not allowed: User not authenticated");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

// Delete a Note
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
    try {

        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(400).send("Note not found");
        }
        if (note.user.toString() != req.user.id) {
            return res.status(400).send("Not allowed: User not authenticated");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Success": "Note has been deleted successfully", note: note })
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})




module.exports = router