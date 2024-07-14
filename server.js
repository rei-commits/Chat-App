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

let messages = [];

app.get('/', (req, res) => {
    res.render('index', { messages });
});

app.post('/messages', (req, res) => {
    const message = req.body;
    messages.push(message);
    io.emit('message', message);
    res.status(201).json(message);
});

app.delete('/messages', (req, res) => {
    messages = [];
    io.emit('clearMessages');
    res.status(200).json({ message: 'Chat log cleared' });
});

io.on('connection', (socket) => {
    socket.on('typing', (user) => {
        socket.broadcast.emit('typing', user);
    });
});

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

app.use(errorHandler);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
