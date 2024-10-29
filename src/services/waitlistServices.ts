// import { sendMail } from "./mailServices";

// const addToWaitlist = async (req, res) => {
//     try {
//         const { email } = req.body;

//         const sent = await sendMail({
//             recipients: [email],
//             subject: 'Welcome to AlignTraits - Your Waitlist Spot is Secured!',
//             email: {
//                 body: {
//                     name: email + " !",
//                     // intro: `We received a request to reset the password for your LearnConnect account associated with this email address: ${user.email}.`,
//                     outro: [
//                         "Thank you for joining the waitlist for AlignTraits, the platform that brings personalized career recommendations based on your unique personality traits. Your spot on the waitlist is officially secured.",

//                         "We're currently in a private alpha and onboarding new users in batches every week.",

//                         "If you want early access, simply reply to this email with 'Interested!'"
//                                             ]
//                 }
//             }
//         });

//         if (sent.error) return res.status(500).json({ message: 'Server error' });
//         if (!(!!sent?.res?.includes('OK'))) return res.status(400).json({ message: 'Something went wrong. Unable to send email. Try again' });

//         //  add mail to database waitlist schema

//         return res.status(200).json({
//             message: 'Waitlist Mail sent successfully',
//         });
//     } catch (error) {
//         console.error('Error requesting OTP: ', error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// export {
//     addToWaitlist
// }
