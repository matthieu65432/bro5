const form = document.getElementById('user-input-form');
const chat = document.getElementById('chat');

// Generate the session ID
const sessionId = uuid.v4();

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  userInput.value = '';

  if (message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = `You: ${message}`;
    chat.appendChild(messageElement);

    const response = await fetch('https://rob6.onrender.com/generate-nova-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include sessionId in the request body
      body: JSON.stringify({ message: message, sessionId: sessionId }),
    });

    let jsonResponse;
    if (response.ok) {
      jsonResponse = await response.json();
    } else {
      const errorText = await response.text();
      console.error(errorText);
      jsonResponse = { message: 'An error occurred while generating a NOVA response.' };
    }

    const novaResponseElement = document.createElement('div');
    novaResponseElement.textContent = `NOVA: ${jsonResponse.message}`;
    chat.appendChild(novaResponseElement);
  }
});
