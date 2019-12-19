const express = require("express");
const request = require("request-promise-native");

const PORT = process.argv[2] || 5001;
const BASE_URL = "https://api.mailgun.net/v3/roam-qa.detroitlabs.com/messages";
const { API_KEY } = process.env;

const app = express();

app.get("/send", (req, res) => {
  const { to, name, body } = req.query;
  if (!to || !name || !body) {
    res.status(400).send(`Must include "to", "name", and "body" query parameters`);
  } else {
    sendMail(to, name, body)
      .then(() => res.json({ message: `Successfully sent to ${to}` }))
      .catch((e) => res.status(500).send(`Error sending email: ${e}`));
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

function sendMail(to, name, body) {
  try {
    const auth = `Basic ${Buffer.from(`api:${API_KEY}`).toString('base64')}`
    const config = {
      method: "POST",
      url: BASE_URL,
      headers: { "Authorization": auth },
      formData: {
        from: "tester@test.com",
        to,
        subject: "Testing email",
        template: "test",
        "h:X-Mailgun-Variables": JSON.stringify({ name, body })
      },
      proxy: "http://localhost:8888"
    }
    return request(config);
  } catch (ex) {
    Promise.reject(ex);
  }
}