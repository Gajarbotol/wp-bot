const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3000;

// Function to get response from OpenAI API
async function getOpenAIResponse(message) {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/completions',
            {
                model: 'text-davinci-003',  // Use GPT-3.5 model name if available
                prompt: message,
                max_tokens: 150
            },
            {
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].text.trim();
    } catch (error) {
        console.error('Error getting response from OpenAI:', error);
        return 'Sorry, I am having trouble responding right now.';
    }
}

// Create a new client instance
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR code generated, please scan it with your WhatsApp');
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {
    console.log(`Message from ${message.from}: ${message.body}`);

    // Get response from OpenAI API
    const response = await getOpenAIResponse(message.body);
    message.reply(response);
});

client.initialize();

// Simple HTTP server to keep the app alive
const app = express();

app.get('/', (req, res) => {
    res.send('WhatsApp bot is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
