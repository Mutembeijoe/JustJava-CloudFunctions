//@ts-check
const app = require("express")();
const cors = require("cors");

const notificationHelper = require("./notificationHelper");
const {
  getDocumentId,
  saveCompletedPayment,
  saveFailedPayment
} = require("./dbHelper");

app.use(cors({ origin: true }));

const parse = require("./parse");

app.post("/:token", (req, res) => {
  console.log("Callback received.");

  const callbackData = req.body.Body.stkCallback;

  console.log(JSON.stringify(callbackData));

  const parsedData = parse(callbackData);

  if (parsedData.resultCode == 0) {
    getDocumentId(parsedData.checkoutRequestID)
      .then(id => saveCompletedPayment(id, parsedData))
      .then(() =>
        notificationHelper.sendMpesaNotification(
          "Your payment was successful.",
          req.params.token
        )
      )
      .then(() => {
        res.send("Completed");
      })
      .catch(err => {
        console.error(err);
        res.send("Completed");
      });
  } else {
    getDocumentId(parsedData.checkoutRequestID)
      .then(id => saveFailedPayment(id, parsedData))
      .then(() =>
        notificationHelper.sendMpesaNotification(
          "Your transaction was not successful.",
          req.params.token
        )
      )
      .then(() => {
        res.send("Completed");
      })
      .catch(err => {
        console.error(err);
        res.send("Completed");
      });
  }
});

module.exports = app;