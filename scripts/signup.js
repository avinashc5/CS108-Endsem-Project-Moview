document.getElementById("signup-button").addEventListener("click", function() {

	let username = document.getElementById('username').value
	
	// if (username == "") {
	// 	alert("Please enter a username")
	// 	return
	// }
	// if (username.length < 3) {
	// 	alert("Username must be at least 3 characters")
	// 	return
	// }
	// if (username.length > 20) {
	// 	alert("Username must be less than 20 characters")
	// 	return
	// }
	// if (!username.match(/^[a-zA-Z0-9_]+$/)) {
	// 	alert("Username can only contain letters, numbers, and underscores")
	// 	return
	// }
	// if (username.match(/^[0-9]+$/)) {
	// 	alert("Username cannot start with a number")
	// 	return
	// }

	let email = document.getElementById('email').value
	
	// if (email == "") {
	// 	alert("Please enter an email")
	// 	return
	// }
	// if (!email.match(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9]+\.[a-zA-Z0-9-.]+$/)) {
	// 	alert("Please enter a valid email")
	// 	return
	// }
	// if (email.match(/^[0-9]+$/)) {
	// 	alert("Email cannot start with a number")
	// 	return
	// }

	let password = document.getElementById('password').value
	
	// if (password == "") {
	// 	alert("Please enter a password")
	// 	return
	// }
	// if (password.length < 8) {
	// 	alert("Password must be at least 8 characters")
	// 	return
	// }
	// if (password.length > 20) {
	// 	alert("Password must be less than 20 characters")
	// 	return
	// }
	// if (!password.match(/^[a-zA-Z0-9]+$/)) {
	// 	alert("Password can only contain letters, numbers, and underscores")
	// 	return
	// }
	// if (password.match(/^[0-9]+$/)) {
	// 	alert("Password must contain atleast one alphabetic character")
	// 	return
	// }

	fetch('http://localhost:3000/signup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'username': username,
			'email': email,
			'password': password
		})
	})
	.then(async response => {
		console.log(response)
		if (response.status == 201) {
			window.location.href = 'index.html';
			return;
		}
		if (response.status == 400) {
			alert(await response.text());
			return;
		}
		if (response.status == 409) {
			alert(await response.text());
			return;
		}
	})	
})