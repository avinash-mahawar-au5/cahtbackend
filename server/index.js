const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const port = process.env.PORT || 7000;

const { addUser, removeUser, getUser, getUserInRoom } = require('./users');
const router = require('./router');
const app = express();
// const server = app.listen(7000);
// const io = require('socket.io').listen(server);
const server = http.createServer(app);
const io = socketio(server);
app.use(router);
app.use(cors());

io.on('connection', (socket) => {
	console.log('We have a new connection');
	socket.on('join', ({ name, room }, callback) => {
		const { error, user } = addUser({ id: socket.id, name, room });

		if (error) return callback(error);

		socket.join(user.room);

		socket.emit('message', {
			user: 'admin',
			text: `${user.name}. Welcome to the room ${user.room}`,
		});

		socket.broadcast
			.to(user.room)
			.emit('message', { user: 'admin', text: `${user.name},has Joined.` });

		callback();
	});

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit('message', { user: user.name, text: message });

		callback();
	});

	socket.on('disconnect', () => {
		console.log('User has left!!!');
	});
});

server.listen(port, () => console.log(`Server is running on port ${port}`));

// server.listen(7000, () => {
// 	console.log('servver is running on 7000');
// });
