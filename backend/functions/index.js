const functions = require("firebase-functions");
const stripe = require("stripe")("sk_test_YOUR_SECRET_KEY"); // Thay thế bằng Secret Key của bạn

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
    try {
        const { amount, currency } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: currency || "vnd",
            payment_method_types: ["card"],
        });

        res.status(200).send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
