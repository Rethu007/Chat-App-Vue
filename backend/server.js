const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const socketIO = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to the Postgres database.
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

client.connect().catch((err) => {
    console.error('Failed to connect to the database', err);
    process.exit(1);
});

// In-memory store for the last 100 messages.
let messages = [];

// Endpoint for getting the last 100 messages.
app.get('/messages', async (req, res) => {
    try {
        const result = await client.query(
            'SELECT username, message FROM (SELECT * FROM messages ORDER BY id DESC LIMIT 100) AS lastOneHundred ORDER BY id ASC;'
        );
        console.log(result);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});

// Endpoint for sending a message.
app.post('/messages', (req, res) => {
    const { username, message } = req.body;
    if (typeof username !== 'string' || typeof message !== 'string') {
        res.status(400).json({ error: 'Bad request' });
        return;
    }
    const newMessage = { username, message };
    const query = {
        name: 'insert-message',
        text: 'INSERT INTO messages(username, message) VALUES ($1, $2)',
        values: [username, message],
    };

    try {
        client.query(query);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save the message' });
    }

    // Emit the new message to all connected clients using Socket.IO
    io.emit('newMessage', newMessage);

    res.status(201).json(newMessage);
});

// Start the server.
const port = 3000; // Listen on port 3000
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
});

const io = socketIO(server, {
    path: '/socket-io', // This should match the path used in the frontend
});

// Socket.IO event for new connections
io.on('connection', (socket) => {
    console.log('New client connected');

    // Send the last 100 messages to the newly connected client
    socket.emit('allMessages', messages);

    // Socket.IO event for new messages from clients
    socket.on('sendMessage', (message) => {
        messages.unshift(message);
        if (messages.length > 100) {
            messages.length = 100;
        }
        // Save the new message to the database (similar to the POST /messages endpoint)
        const query = {
            name: 'insert-message',
            text: 'INSERT INTO messages(username, message) VALUES ($1, $2)',
            values: [message.username, message.message],
        };

        try {
            client.query(query);
        } catch (err) {
            console.error('Failed to save the message to the database:', err);
        }

        // Broadcast the new message to all connected clients except the sender
        socket.broadcast.emit('newMessage', message);
    });

    // Socket.IO event for disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
