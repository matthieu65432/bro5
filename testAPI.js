const openai = require('openai');

// Replace 'your_api_key' with your actual API key
openai.apiKey = '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';

async function testAPI() {
    try {
        const prompt = 'Rap like a rapper: Hello, how are you?';

        const response = await openai.Completion.create({
            engine: 'davinci',
            prompt: prompt,
            max_tokens: 50,
            n: 1,
            stop: null,
            temperature: 0.8,
        });
node testAPI.js

        console.log(response.choices[0].text.trim());
    } catch (error) {
        console.error('Error:', error);
    }
}

testAPI();
