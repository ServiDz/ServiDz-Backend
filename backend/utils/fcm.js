const admin = require("firebase-admin");
const serviceAccount = require("../config/firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendNotification = async (token, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    token,
    data, // Optional: custom data for Flutter
  };

  try {
    await admin.messaging().send(message);
    console.log("✅ Notification sent");
  } catch (error) {
    console.error("❌ FCM Error:", error.message);
  }
};

module.exports = { sendNotification };
