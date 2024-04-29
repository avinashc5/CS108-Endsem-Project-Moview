document.getElementById("signin-button").addEventListener("click", function() {
	let email = document.getElementById('email').value
	let password = document.getElementById('password').value
	fetch('http://localhost:3000/signin', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: email,
			password: password
		})
	})
	.then(async response => {
		if (response.status == 200) {
			window.location.href = "index.html"
		}
		else if (response.status == 401) {
			alert(await response.text())
		}
	})
	.catch(err => {
		if (err == "TypeError: Failed to fetch") {
			alert("Please check if the server is running")
		}
		else {
			alert(err)
		}
	})
	
	// window.location.href = "index.html"
})
