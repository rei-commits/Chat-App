document.addEventListener('DOMContentLoaded', () => {
    const socket = io();

    const messagesList = document.getElementById('messages');
    const messageForm = document.getElementById('message-form');
    const userInput = document.getElementById('user');
    const textInput = document.getElementById('text');
    const themeToggle = document.getElementById('theme-toggle');

    // Toggle theme
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // Add a new message to the list
    socket.on('message', (message) => {
        const li = document.createElement('li');
        const avatar = document.createElement('div');
        avatar.classList.add('avatar');
        avatar.textContent = message.user.charAt(0).toUpperCase(); // User initial
        li.appendChild(avatar);
        const text = document.createElement('span');
        text.textContent = `${message.user}: ${message.text}`;
        li.appendChild(text);
        messagesList.appendChild(li);
    });

    // Handle form submission
    messageForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = {
            user: userInput.value,
            text: textInput.value
        };
        fetch('/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(message)
        }).then(response => response.json())
          .then(data => {
              textInput.value = '';
              textInput.focus();
          });
    });

    textInput.addEventListener('input', () => {
        socket.emit('typing', userInput.value);
    });

    socket.on('typing', (user) => {
        const typingIndicator = document.getElementById('typing-indicator');
        typingIndicator.textContent = `${user} is typing...`;
        setTimeout(() => { typingIndicator.textContent = ''; }, 3000);
    });
});
