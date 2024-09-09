import otpGenerator from 'otp-generator';

export const loginRequired = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1] ?? '';
    if (!token) return res.status(401).send('Access denied, empty token');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {verified, ...req.user};
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

export const preventLoggedUser = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return next();

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {verified, ...req.user};
        return res.status(401).send('Access denied. Empty token');
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

export const generateOtp = (length=6) => otpGenerator.generate(length, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});