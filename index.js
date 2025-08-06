const express = require("express");
const bodyParser = require("body-parser");
const { GoogleAuth } = require("google-auth-library");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post("/index-url", async (req, res) => {
  const urlToIndex = req.body.url;

  if (!urlToIndex) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    const auth = new GoogleAuth({
      keyFile: "./keys/service-account.json",
      scopes: ["https://www.googleapis.com/auth/indexing"],
    });

    const client = await auth.getClient();

    const indexingEndpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";

    const result = await client.request({
      url: indexingEndpoint,
      method: "POST",
      data: {
        url: urlToIndex,
        type: "URL_UPDATED",
      },
    });

    res.send(result.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send({
      error: error.response?.data || "Something went wrong",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

