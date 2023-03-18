require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { google } = require('googleapis');
const uuid = require('uuid');
const fs = require('fs');

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors());

const serviceAccount = JSON.parse(fs.readFileSync('xskillz-1163-249eb19cbecb.json', 'utf8'));

const sheets = google.sheets({
  version: 'v4',
  auth: new google.auth.JWT(
    serviceAccount.client_email,
    null,
    serviceAccount.private_key,
    ['https://www.googleapis.com/auth/spreadsheets'],
  ),
});

const SPREADSHEET_ID = '1klIm6nzua3DY71qTMKor6kH96YuT_gvy6iNj6IkKSO4';

async function appendRowToSheet(sessionId, type, message) {
  const timestamp = new Date().toISOString();
  const values = [[sessionId, timestamp, type, message]];

  console.log(`Appending row to sheet: ${JSON.stringify(values)}`);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Feuille 1!A:D',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: values,
    },
  });
}

async function generateBROResponse(userMessage) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "user",
            content: userMessage
          }
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    console.log('OpenAI API Response:', response.data); // Add this line to log the response

    const BROResponse = response.data.choices[0].message.content;
    return BROResponse;
  } catch (error) {
    console.error('Error generating BRO response:', error);
    return 'An error occurred while generating a BRO response.';
  }
}

app.post('/generate-bro-response', async (req, res) => {
  const sessionId = req.body.sessionId;
  const userMessage = req.body.message;
  
  console.log('Received user message:', userMessage);
  await appendRowToSheet(sessionId, 'User', userMessage);
  const BROReply = await generateBROResponse(userMessage);
  console.log('Generated BRO reply:', BROReply);
  await appendRowToSheet(sessionId, 'BRO', BROReply);
  res.json({ message: BROReply });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
