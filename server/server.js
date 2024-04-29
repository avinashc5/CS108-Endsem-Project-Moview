const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const fs = require('fs');
const spawn = require('child_process').spawn;


const app = express();
const PORT = 3000;

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(session({
	secret: 'your-secret-key', // This is a secret key to encrypt the session cookies
	resave: false, // If set to false then the session is only saved when it is modified. If set to true, the session is saved even if it was not modified.
	saveUninitialized: true // If set to false then an uninitialized session is destroyed when the response is sent. If set to true, an uninitialized session is saved.
}))

// The session middleware is used to store session data on the server-side. It creates a session object for each user and stores it in a temporary location (either in memory or on disk) and then gives each user a unique session ID that is stored as a cookie in the user's browser. The next time the user visits the website, their browser sends the session ID to the server, which is then used to retrieve the stored session data from the temporary location.

// The secret key is used to encrypt and sign the session cookies, making them more secure. The resave and saveUninitialized options determine when the session data is saved on the server. If the session is not modified, it is not necessary to save it, which can improve performance. If an uninitialized session is visited, it is not destroyed, which can be useful if you want to keep track of the user's activity but do not need to store any data in the session yet.

// This middleware is used in this codebase to store session data for the currently logged-in user, so that we can keep track of who is logged in and what their user data is.


function isEmpty(obj) {
	return Object.keys(obj).length === 0;
}

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the static files from the React app
app.use(express.static('public'));

let current_user = {}

app.get('/profile', (req, res) => {
	if (Object.keys(current_user).length === 0) {
		res.status(401).send('Not logged in');
		return;
	}
	else {
		res.status(200).json(current_user);
		return;
	}
})

// Handler function for the signup request
app.post('/signup', (req, res) => {
	console.log(req.body);
	users = fs.readFileSync('users.json');
	users = JSON.parse(users);
	let new_user = req.body;
	if (new_user.username == "") {
		res.status(400).send('Please enter a username');
		return
	}
	if (new_user.username.length < 3) {
		res.status(400).send('Username must be at least 3 characters');
		return
	}
	if (new_user.username.length > 20) {
		res.status(400).send('Username must be less than 20 characters');
		return
	}
	if (!new_user.username.match(/^[a-zA-Z0-9_]+$/)) {
		res.status(400).send('Username can only contain letters, numbers, and underscores');
		return
	}
	if (new_user.username.match(/^[0-9]+$/)) {
		res.status(400).send('Username cannot start with a number');
		return
	}

	if (new_user.email == "") {
		res.status(400).send('Please enter an email');
		return
	}
	if (!new_user.email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.[a-zA-Z0-9-.]+$/)) {
		res.status(400).send('Please enter a valid email');
		return
	}
	if (new_user.email.match(/^[0-9]+$/)) {
		res.status(400).send('Email cannot start with a number');
		return
	}

	if (new_user.password == "") {
		res.status(400).send('Please enter a password');
		return
	}
	if (new_user.password.length < 8) {
		res.status(400).send('Password must be at least 8 characters');
		return
	}
	if (new_user.password.length > 20) {
		res.status(400).send('Password must be less than 20 characters');
		return
	}
	if (!new_user.password.match(/^[a-zA-Z0-9]+$/)) {
		res.status(400).send('Password can only contain letters, numbers, and underscores');
		return
	}
	if (new_user.password.match(/^[0-9]+$/)) {
		res.status(400).send('Password must contain atleast one alphabetic character');
		return
	}

	for (user of users) {
		if (user.email === new_user.email) {
			res.status(409).send('Email already exists');
			return;
		}
	}
	current_user = new_user;
	users.push(new_user);
	res.status(201).json(new_user);
	fs.writeFileSync('users.json', JSON.stringify(users, null, 4));
});

app.post('/signin', (req, res) => {
	let user = req.body;
	console.log(user);
	users = fs.readFileSync('users.json');
	users = JSON.parse(users);
	for (u of users) {
		if (u.email == user.email && u.password == user.password) {
			current_user = u;
			res.status(200).send('Logged in successfully');
			return;
		}
	}
	res.status(401).send('Invalid credentials');
})

app.get('/signout', (req, res) => {
	current_user = {};
	res.status(200).send('Logged out successfully');
})

app.post('/rate', (req, res) => {
	let rate = req.body;
	try {
		let file_name = current_user.email.slice(0, current_user.email.indexOf('@')) + '.json';
		if (!fs.existsSync(file_name)) {
			fs.writeFileSync(file_name, '[]');
		}
		let rates = fs.readFileSync(file_name);
		rates = JSON.parse(rates);
		let found = false;
		for (movie of rates) {
			if (movie['movie name'] == rate['movie name']) {
				movie['rating'] = rate['rating'];
				found = true;
				break;
			}
		}
		if (!found) {
			rates.push(rate);
		}
		fs.writeFileSync(file_name, JSON.stringify(rates, null, 4));
		res.status(201).send('Rate updated successfully');
		return;
	} catch (err) {
		console.log(err);
		res.status(500).send('Error while adding the rate');
		return;
	}
})

app.post('/rating', (req, res) => {
	let movie_name = req.body['movie name'];
	if (Object.keys(current_user).length == 0) {
		res.status(401).send('Please sign in');
		return;
	}
	let file_name = current_user.email.slice(0, current_user.email.indexOf('@')) + '.json';
	if (!fs.existsSync(file_name)) {
		res.status(404).send('No ratings found');
		return;
	}
	let rates = fs.readFileSync(file_name);
	rates = JSON.parse(rates);
	for (rate of rates) {
		if (rate['movie name'] == movie_name) {
			res.status(200).json(rate);
			return;
		}
	}
	res.status(404).send('No ratings found');
	return;
})

app.get('/shouldsuggest', (req, res) => {
	let file_name = current_user.email.slice(0, current_user.email.indexOf('@')) + '.json';

	if (!fs.existsSync(file_name)) {
		res.status(404).send('No ratings found');
		return;
	}
	let rates = fs.readFileSync(file_name);
	rates = JSON.parse(rates);
	if (rates.length >= 5) {
		res.status(200).send('true');
		return;
	}
	res.status(200).send('false');
})

app.get('/suggestions', (req, res) => {
	const filename = current_user.email.slice(0, current_user.email.indexOf('@'));
	const pythonProcess = spawn('python3', ['suggest.py', filename]);
	
	pythonProcess.on('error', (err) => {
		console.log(err);
		res.status(500).send('Error while giving suggestions');
		return;
	})
	
	setTimeout(() => {
		let suggestions = JSON.parse(fs.readFileSync(filename + 'suggestions.json'))
		res.status(200).json(suggestions);
	}, 3000);

	// let file_name = current_user.email.slice(0, current_user.email.indexOf('@')) + '.json';
	// if (!fs.existsSync(file_name)) {
	// 	res.status(404).send('No ratings found');
	// 	return;
	// }
	// let rated_movies = fs.readFileSync(file_name);
	// rated_movies = JSON.parse(rated_movies);

	// let movies = fs.readFileSync('../movies.json');
	// movies = JSON.parse(movies);
	// let unrated_movies = movies.filter(movie => !rated_movies.some(rated_movie => rated_movie['movie name'] == movie['Movie Name']));

	// let suggestions = [];
	// let genre_year_map = new Map();
	// for (rated_movie of rated_movies) {
	// 	let genre = rated_movie['Genre'];
	// 	let year = rated_movie['Year'];
	// 	if (!genre_year_map.has(genre)) {
	// 		genre_year_map.set(genre, new Set());
	// 	}
	// 	genre_year_map.get(genre).add(year);
	// }

	// for (movie of movies) {
	// 	let genre = movie['Genre']
	// 	let year = movie['Year']
	// 	if (genre_year_map.has(genre) && genre_year_map.get(genre).has(year)) {
	// 		suggestions.push(movie['Movie Name']);
	// 	}
	// }
	// console.log(suggestions)

})

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

