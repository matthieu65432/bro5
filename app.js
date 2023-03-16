const form = document.getElementById('user-input-form');
const chat = document.getElementById('chat');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  userInput.value = '';

  if (message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message}`;
    chat.appendChild(messageElement);

    const response = await fetch('https://rob5.onrender.com:3002/generate-bro-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message }),
    });

    console.log(response); // Add this line to inspect the response
    const jsonResponse = await response.json();

    const broResponseElement = document.createElement('div');
    broResponseElement.textContent = `BRO: ${jsonResponse.message}`;
    chat.appendChild(broResponseElement);
  }
});
