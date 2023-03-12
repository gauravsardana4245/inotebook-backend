const express = require("express")
const router = express.Router();
const User = require("../Models/Users")
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require("../middlewares/fetchuser")

let success = false;
const JWT_SECRET = "harrysisagoodb$oy"

// Creating a route to sign up
router.post("/createuser", [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password must be atleast 5 characters long').isLength({ min: 5 })

], async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ success, error: "Sorry a user with this email already exist" });
        }
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email
        })

        // .then(user => res.json(user))
        //     .catch(err => {
        //         console.log(err)
        //         res.json({ error: "Please enter a unique value for email" })
        //     })
        const data = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authtoken = jwt.sign(data, JWT_SECRET);
        res.json({ success, authtoken, name: user.name });
        // console.log(authtoken);
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }
})

//Creating a route for login
router.post("/login", [
    body('email', 'Enter a valid email address').isEmail(),
    body('password', 'Password cannot be blank').exists()],
    async (req, res) => {
        let success = false;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }


        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ success, error: "Please try to login with correct credentials: Entered email does not exist" });
            }
            const comparePassword = await bcrypt.compare(password, user.password);
            if (!comparePassword) {

                return res.status(400).json({ success, error: "Please try to login with correct credentials : Password incorrect" });
            }
            const data = {
                user: {
                    id: user.id
                }
            }
            const authtoken = jwt.sign(data, JWT_SECRET);
            success = true;
            res.json({ success, authtoken, name: user.name });
            // console.log(authtoken);
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error occured");
        }



    })

router.get("/getuser", fetchuser, async (req, res) => {
    try {
        const userid = req.user.id;
        const user = await User.findById(userid).select("-password")
        res.status(200).json({ user, name: user.name });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error occured");
    }

})
module.exports = router