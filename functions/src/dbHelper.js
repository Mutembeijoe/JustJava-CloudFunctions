//@ts-check
const admin = require("firebase-admin");
const firestore = admin.firestore();
const moment = require("moment");

/**
 * @param {String} checkoutRequestID CheckoutRequestID from Safaricom
 */
function getDocumentId(checkoutRequestID) {
  return firestore
    .collection("payments")
    .where("checkoutRequestId", "==", checkoutRequestID)
    .limit(1)
    .get()
    .then(snapshot => snapshot.docs[0].id);
}

/**
 * @param {String} id Document id for the payment
 * @param {Object} parsedData Parsed callback data
 */
function saveCompletedPayment(id, parsedData) {
  return firestore
    .collection("payments")
    .doc(id)
    .update({
      amount: parsedData.amount,
      mpesaReceiptNumber: parsedData.mpesaReceiptNumber,
      date: moment().unix(),
      dateSaf: parsedData.transtactionDate,
      phoneNumber: parsedData.phoneNumber,
      status: "completed",
      resultDesc: parsedData.resultDesc,
      resultCode: parsedData.resultCode
    });
}

/**
 * @param {String} id Document id for the payment
 * @param {Object} parsedData Parsed callback data
 */
function saveFailedPayment(id, parsedData) {
  return firestore
    .collection("payments")
    .doc(id)
    .update({
      resultDesc: parsedData.resultDesc,
      resultCode: parsedData.resultCode,
      date: moment().unix(),
      status: "failed"
    });
}

module.exports = {
  getDocumentId,
  saveCompletedPayment,
  saveFailedPayment
};