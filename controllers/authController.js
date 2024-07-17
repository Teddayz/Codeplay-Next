//user_signup_post, user_login_post, user_signup_get, user_login_get, user_logout_get, check_username_post
const passport = require('passport');
const User = require('../models/user');

const user_signup_post = async (req, res) => {
    const { username, password, confirmpassword } = req.body;
    if (password !== confirmpassword) {
        req.flash('error_msg', 'Passwords do not match');
        return res.redirect('/auth/signup');
    }
    
    try {
        const user = new User({ username, password });
        await user.save();
        res.redirect('/auth/login');
    } catch(e) {
        req.flash('error_msg', 'Username already exists.');
        res.redirect('/auth/signup');
    }
};

const user_signup_get = (req, res) => {
    res.render('auth/signup', { title: 'Sign Up', errorMessage: req.flash('error_msg') });
};

const user_login_post = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('homepage', { errorMessage: 'Invalid username or password.' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/index');
        });
    })(req, res, next);
};

const user_login_get = (req, res) => {
    res.render('homepage', { errorMessage: req.flash('error') });
};

const user_logout_get = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/');
    });
};

const check_username_post = async (req, res) => {
    const { username } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.json({ exists: true });
        }
        return res.json({ exists: false });
    } catch (e) {
        return res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    user_signup_get,
    user_signup_post,
    user_login_get,
    user_login_post,
    user_logout_get,
    check_username_post
};
