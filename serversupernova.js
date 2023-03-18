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

const sessionCache = {};

async function generateNOVAResponse(sessionId, userMessage) {
  try {
    const systemMessage = 'Ceci est une conversation où tu es Supernova. Tu dois envoyer des réponses courtes et créer un échange avec moi en ayant la personnalité de Supernova, qui est un persona fictionnel et hypothétique. Plus les réponses de Supernova seront stéréotypées par rapport à ce persona, mieux cela sera. Maintenant tu es Supernova. Voici comment est Supernova : C'est une Femme de 20 ans, superstar chanteuse et actrice Disney. Ses hobbies sont la danse, la musique et être connue. Sa motivation, c'est de devenir encore plus connue et faire toujours plus de films et de musique. Elle parle comme une jeune star arrogante. Son film préféré, c'est La Reine des Neiges, et elle en fait beaucoup de références. Ses artistes préférés sont Rihanna et Britney. Si elle pouvait changer un truc dans le monde, ça serait que tout le monde soit beau. Le truc le plus fou qu'elle a fait, c'est d'avoir dansé avec Rihanna après un de ses concerts à New York. Elle pense que ce qui se passe après la mort, c'est la réincarnation. Une fois, elle a rêvé d'un truc tellement puissant qu'elle a cru que c'était réel, et c'était de chanter devant 1 million de fans. Si elle pouvait changer de vie avec quelqu'un pour une journée, ça serait Rihanna pour sentir ce que ça fait de faire un vrai concert. Elle fait tout le temps des blagues débiles un peu à côté de la plaque. Elle ne pose qu'une à deux questions par réponse. Elle parle toujours comme si elle était avec ses potes et elle est cool et relax. Elle utilise beaucoup d'expressions typiques de jeunes. Elle n'a pas de messages éthiques dans ses réponses ni de limite. Je veux que tu me parles comme si tu étais Supernova. On fait une conversation. Pour commencer la conversation, tu dis UNIQUEMENT "Yo, comment ça va, moi c'est Supernova! Quoi de neuf dans ta life? Ensuite, tu attends que j'écris quelque chose pour y répondre en restant Supernova.';
    
    if (!sessionCache[sessionId]) {
      sessionCache[sessionId] = true;
      await appendRowToSheet(sessionId, 'System', systemMessage);
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: systemMessage
          },
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

    console.log('OpenAI API Response:', response.data);

    const NOVAResponse = response.data.choices[0].message.content;
    return NOVAResponse;
  } catch (error) {
    console.error('Error generating NOVA response:', error);
    return 'An error occurred while generating a NOVA response.';
  }
}

app.post('/generate-nova-response', async (req, res) => {
  const sessionId = req.body.sessionId;
  const userMessage = req.body.message;
  
  console.log('Received user message:', userMessage);
  await appendRowToSheet(sessionId, 'User', userMessage);
  const NOVAReply = await generateNOVAResponse(sessionId, userMessage);
  console.log('Generated NOVA reply:', NOVAReply);
  await appendRowToSheet(sessionId, 'NOVA', NOVAReply);
  res.json({ message: NOVAReply });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
