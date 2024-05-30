import otpGenerator from 'otp-generator';

export const login_required = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {verified, ...req.user};
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};

export const preventLoggedUser = (req, res, next) => {

}

export const generateOtp = () => otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false});