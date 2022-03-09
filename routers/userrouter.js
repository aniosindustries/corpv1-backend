const router = require('express').Router();
const User = require('../models/usermodel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

router.get("/users", (req, res) => {
    try {
        
        const users = User.find();
        res.json(users);
    } 
    catch (err) {
        res.status(500).send();
    }
});


//register user
router.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email){
            res.status(400).json({
                "errorMessage":"Please fill out all fields"
            });
        }
        if(password.length < 8){
            res.status(400).json({
                "errorMessage":"Password must be at least 8 characters"
            });
        }
        //make sure no account exists with that email
        const existingUser = await User.findOne({email});
        if(existingUser){
            res.status(400).json({
                "errorMessage":"Email already exists"
            });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = new User({
            username,
            password: passwordHash,
            email
        });
        const savedUser = await newUser.save();
        
        const token = jwt.sign({
            id: savedUser._id
        }, process.env.JWT_TOKEN
        
        );
        res.cookie("token", token, {httpOnly: true, sameSite: process.env.NODE_ENV === 'development' ? 'lax' : process.env.NODE_ENV === 'production' && 'none', secure: process.env.NODE_ENV === 'development' ? false : process.env.NODE_ENV === 'production' && true}).send();
    }
    catch (err) {
        res.status(500).send();
    }
});

//login existing user
router.post('/login', async (req, res) =>{
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            return res.status(400).json({msg: 'Please enter all fields'});
        }
        const existingUser = await User.findOne({username});
        if (!existingUser) {
            return res.status.json({msg: 'Wrong username or password'});
        }
        const match = await bcrypt.compare(password, existingUser.password);
        if (!match) {
            return res.status(401).json({msg: 'Wrong username or password'});
        }
        const token = jwt.sign({id: existingUser._id}, process.env.JWT_TOKEN, {expiresIn: '1h'});
        res.cookie('token', token, {httpOnly: true, sameSite: process.env.NODE_ENV === 'development' ? 'lax' : process.env.NODE_ENV === 'production' && 'none', secure: process.env.NODE_ENV === 'development' ? false : process.env.NODE_ENV === 'production' && true}).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send();
    }
});

router.get('/loggedIn', (req, res) => {
    try{
        const token = req.cookies.token;
        if(!token) return res.json(null);
        const validatedUser = jwt.verify(token, process.env.JWT_TOKEN);
        res.json(validatedUser.id);
    } catch(err){
        console.log(err);
       return res.json(null);
    }
})

router.get('/logOut', (req, res) => {
    try{
        res.clearCookie('token', '', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'development'
             ? 'lax' 
             : process.env.NODE_ENV === 'production' && 'none',
              secure: process.env.NODE_ENV === 'development' 
              ? false 
              : process.env.NODE_ENV === 'production' && true,
              expires: new Date(0),
        }).send();
    } catch(err){
        console.log(err);
       return res.json(null);
    }
})

module.exports = router;