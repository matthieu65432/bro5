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

    const response = await fetch('https://rob5.onrender.com/generate-bro-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message }),
    });

    let jsonResponse;
if (response.ok) {
  jsonResponse = await response.json();
} else {
  const errorText = await response.text();
  console.error(errorText);
  jsonResponse = { message: 'An error occurred while generating a Supernova response.' };
}


    const novaResponseElement = document.createElement('div');
    novaResponseElement.textContent = `Nova: ${jsonResponse.message}`;
    chat.appendChild(novaResponseElement);
  }
});