import crypto from 'crypto';

// Mock PhonePe Service
// In a real implementation, this would handle the actual API calls to PhonePe

const SALT_KEY = "MOCK_SALT_KEY";
const SALT_INDEX = 1;

export const initiatePayment = async (amount, userId, redirectUrl) => {
    // 1. Create Payload
    const payload = {
        merchantId: "MOCK_MERCHANT_ID",
        merchantTransactionId: `MT${Date.now()}`,
        merchantUserId: userId,
        amount: amount * 100, // Amount in paise
        redirectUrl: redirectUrl,
        redirectMode: "REDIRECT",
        callbackUrl: "https://your-server.com/api/payment-callback",
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    // 2. Generate Checksum (X-VERIFY header)
    // SHA256(base64Payload + "/pg/v1/pay" + saltKey) + ### + saltIndex
    const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const checksum = sha256 + "###" + SALT_INDEX;

    // 3. Mock API Call
    // const response = await axios.post(...) 

    // For now, return a success mock
    return {
        success: true,
        data: {
            instrumentResponse: {
                redirectInfo: {
                    url: redirectUrl // In real life, this is the PhonePe payment page URL
                }
            },
            merchantTransactionId: payload.merchantTransactionId
        }
    };
};

export const verifyPayment = async (merchantTransactionId) => {
    // 1. Generate Checksum for Status Check
    // SHA256("/pg/v1/status/" + merchantId + "/" + merchantTransactionId + saltKey) + ### + saltIndex

    // Mock Success Response
    return {
        success: true,
        code: "PAYMENT_SUCCESS",
        message: "Payment Successful",
        data: {
            merchantTransactionId: merchantTransactionId,
            amount: 900,
            state: "COMPLETED",
            responseCode: "SUCCESS"
        }
    };
};
