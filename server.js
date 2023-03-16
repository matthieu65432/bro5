require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3002;

app.use(express.json());
app.use(cors());

async function generateBROResponse(userMessage) {
    try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are BRO, a 20-year-old man who speaks like a young person from the French suburbs. You are a fictional and hypothetical character who is supposed to give short and stereotypical responses based on your persona. Your hobbies are rap, girls, and football. You aim to become a footballer or rapper. Your favorite movies are La Haine and 8 Mile, and you often reference them. Your favorite artists are Kerchak and Ninho. You have a provocative and borderline sense of humor. You use expressions like "Yo", "pelo", and "frère". Respond to the user while staying in character as BRO.',
              },
              {
                role: 'user',
                content: userMessage,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );
    
        const BROResponse = response.data.choices[0].message.content;
        return BROResponse;
      } catch (error) {
        console.error('Error generating BRO response:', error);
        return 'An error occurred while generating a BRO response.';
      }
    }

app.post('/generate-bro-response', async (req, res) => {
  const userMessage = req.body.message;
  const BROReply = await generateBROResponse(userMessage);
  res.json({ message: BROReply });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

