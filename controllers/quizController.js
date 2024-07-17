//quiz_index, quiz_details, quiz_create_get, quiz_create_post, quiz_delete, completedQuiz, quiz_attempt, quiz_submit
const Quiz = require('../models/quiz');

const { updateUserExp } = require('../utils/exp');

const quiz_index = (req, res) => {
    Quiz.find()
    .then(result => {
        res.render('quizzes/index', { title: 'All Quizzes', quizzes: result });
    })
    .catch(err => {
        console.log(err);
    });
};

const quiz_details = (req, res) => {
    const id = req.params.id;
    Quiz.findById(id)
        .then(result => {
            res.render('quizzes/details', { quiz: result, title: 'Quiz Details' });
        })
        .catch(err => {
            res.status(404).render('404', { title: 'Quiz not found' });
        });
};

const quiz_create_get = (req, res) => {
    res.render('quizzes/create_quiz', { title: 'Create Quiz' });
};

const quiz_create_post = (req, res) => {
    const { title, author, questions, exp } = req.body;

    const quiz = new Quiz({
        title,
        author,
        questions,
        exp: exp || 20 // Default value if not provided
    });

    quiz.save()
    .then((result) => {
        res.redirect('/quizzes');
    })
    .catch((err) => {
        console.log(err);
        res.status(500).send('An error occurred while saving the quiz.');
    });
};

const quiz_delete = (req, res) => {
    const id = req.params.id;
    Quiz.findByIdAndDelete(id)
        .then(result => {
        res.json({ redirect: '/quizzes' });
        })
        .catch(err => {
            console.log(err);
        });
};

const completedQuiz = async (req, res) => {
    try {
        const quizId = req.params.id;
        const userId = req.user.id;
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const expGained = quiz.exp;
        const { exp, level, levelUp } = await updateUserExp(userId, expGained);
        res.json({
            message: 'Quiz completed successfully!',
            redirect: '/quizzes'
        });
    } catch (err) {
        res.status(500).json({ message: 'An error has occurred' });
    }
};

const quiz_attempt = (req, res) => {
    const id = req.params.id;
    Quiz.findById(id)
    .then(result => {
        res.render('quizzes/quiz', { quiz: result, title: 'Attempt Quiz' });
    })
    .catch(err => {
        res.status(404).render('404', { title: 'Quiz not found' });
    });
};

const quiz_submit = async (req, res) => {
    const id = req.params.id;
    const { answers } = req.body;

    try {
        const quiz = await Quiz.findById(id);
        const userId = req.user.id;
        if (!quiz) {
            return res.status(404).render('404', { title: 'Quiz not found' });
        }

        let score = 0;
        quiz.questions.forEach((question, index) => {
            if (question.correctAnswer === answers[index]) {
                score++;
            }
        });
        const expGained = (score / quiz.questions.length) * quiz.exp;
        const { exp, totalExp, level, levelUp } = await updateUserExp(userId, expGained);
        const expTable = [20, 50, 100, 300, 600, 1000];

        res.render('quizzes/result', { quiz, score, expGained, exp, level, levelUp, expTable, totalExp, title: 'Quiz Result' });
    } catch (err) {
        console.error('Error submitting quiz:', err);
        res.status(500).send('An error occurred while submitting the quiz.');
    }
};

module.exports = {
    quiz_index,
    quiz_details,
    quiz_create_get,
    quiz_create_post,
    quiz_delete,
    completedQuiz,
    quiz_attempt,
    quiz_submit
};
