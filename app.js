const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const initializePassport = require('./passport-config');
const quizRoutes = require('./routes/quizRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const cors = require('cors');

// Express app
const app = express(cors());
initializePassport(passport);

// Connect to MongoDB Atlas
const dbURI = 'mongodb+srv://Codeplayadmin:Codeplayadmin@codeplay.yquzy4x.mongodb.net/Codeplay?retryWrites=true&w=majority&appName=Codeplay';
mongoose.connect(dbURI)
    .then((result) => app.listen(5000, () => console.log('Server is running on port 5000')))
    .catch((err) => console.log(err));

// Register view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add this line to parse JSON bodies
app.use(morgan('dev'));

app.use(session({
    secret: 'secret', 
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.get('/', authMiddleware.forwardAuthenticated, (req, res) => {
    res.render('homepage', { title: 'Homepage', errorMessage: req.flash('error') });
});

app.get('/index', authMiddleware.ensureAuthenticated, (req, res) => {
    res.render('index', { title: 'Index' });
});

app.get('/about', authMiddleware.ensureAuthenticated, (req, res) => {
    res.render('about', { title: 'About' });
});

app.get('/about_logged_out', authMiddleware.forwardAuthenticated, (req, res) => {
    res.render('about_logged_out', { title: 'About' });
});


// Quiz routes
app.use('/quizzes', authMiddleware.ensureAuthenticated, quizRoutes);

// User routes
app.use('/api', userRoutes);

// Auth routes
app.use('/auth', authRoutes); 

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});
