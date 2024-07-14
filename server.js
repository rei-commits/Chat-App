const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(logger);

app.set('view engine', 'ejs');

// Data storage (in-memory for simplicity)
let messages = [];

// Routes
app.get('/messages', (req, res) => {
    let filteredMessages = [...messages];

    // Example filtering by user (if 'user' query parameter is provided)
    const { user } = req.query;
    if (user) {
        filteredMessages = filteredMessages.filter(msg => msg.user === user);
    }

    res.json(filteredMessages);
});

app.post('/messages', (req, res) => {
    const message = req.body;
    messages.push(message);
    io.emit('message', message);
    res.status(201).json(message);
});

app.patch('/messages/:id', (req, res) => {
    const { id } = req.params;
    const { text } = req.body;

    if (!messages[id]) {
        return res.status(404).json({ error: 'Message not found' });
    }

    messages[id].text = text;
    io.emit('messageUpdated', messages[id]);
    res.status(200).json(messages[id]);
});

app.delete('/messages', (req, res) => {
    messages = [];
    io.emit('clearMessages');
    res.status(200).json({ message: 'Chat log cleared' });
});

// Views
app.get('/', (req, res) => {
    res.render('index', { messages });
});

// Error handling
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use(errorHandler);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
