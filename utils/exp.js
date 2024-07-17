const User = require('../models/user');

const expTable = [20, 50, 100, 300, 600, 1000];

const updateUserExp = async (userId, expGained) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.exp += expGained;
        user.totalExp += expGained;

        let levelUp = false;
        while (user.level < expTable.length && user.exp >= expTable[user.level - 1]) {
            user.exp -= expTable[user.level - 1];
            user.level++;
            levelUp = true;
        }
        await user.save();
        return { exp: user.exp, totalExp: user.totalExp, level: user.level, levelUp };
    } catch(err) {
        throw err;
    }
}

module.exports = {
    updateUserExp
}