if(performance.navigation.type == 2){
	location.reload(true);
}

const link = new URL(window.location.href);
const movie_name = decodeURI(link).split('?')[1];

let clicked_number = -1;

document.addEventListener('DOMContentLoaded', function() {
	fetch('http://localhost:3000/profile', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	.then(async response => {
		if (response.status == 200) {
			document.getElementById('login-options-div').innerHTML = '<div class="profile-div" id="profile" onclick=showProfile()><img src="assets/profile.jpg" alt="" class="profile"></div><div class="profile-options" id="profile-options"><a id="username"></a><a id="email"></a><a id="signout">Sign out</a></div>';
			let profile_options = document.getElementById('profile-options');
			response.json().then(data => {
				profile_options.children[0].innerHTML = 'Welcome ' + data['username'];
				profile_options.children[1].innerHTML = data['email'];
				profile_options.children[2].addEventListener('click', function() {
					fetch('http://localhost:3000/signout', {
						method: 'GET',
						headers: {
							'Content-Type': 'application/json'
						},
					})
					.then(response => {
						if (response.status == 200) {
							window.location.href = "signin.html";
						}
						else if (response.status == 401) {
							alert('Sign out failed!');
						}
					})
				})
			})
		}
		else if (response.status == 401) {
			document.getElementById('login-options-div').innerHTML = '<div class="login-options" id="login-options"><a href="signin.html" class="signin">Sign in</a></div>'
		}
	})
})

function showProfile() {
	document.getElementById('profile-options').style.display = 'block';
};

document.getElementById('login-options-div').addEventListener('mouseleave', function() {
	document.getElementById('profile-options').style.display = 'none';
})

document.addEventListener('DOMContentLoaded', function(){
	const link = new URL(window.location.href);
	const search = decodeURI(link).split('?')[1];
	fetch('movies.json')
	.then(response => response.json())
	.then(data => {
		data.some(function(element) {
			if (element["Movie Name"] == search) {
				console.log(element)
				document.title = element['Movie Name'];
				if (element['Year'] != null) {
					document.getElementById('year-span').innerHTML = element['Year'];
				}
				else {
					document.getElementById('year-span').innerHTML = 'N/A';
				}
				if (element['Duration'] != null) {
					document.getElementById('duration-span').innerHTML = element['Duration'];
				}
				else {
					document.getElementById('duration-span').innerHTML = 'N/A';
				}
				if (element['Ad Cat'] != null) {
					document.getElementById('adcat-span').innerHTML = element['Ad Cat'];
				}
				else {
					document.getElementById('adcat-span').innerHTML = 'Not Rated';
				}
				if (element['Rating'] != null) {
					document.getElementById('rating-span').innerHTML = element['Rating'] + '/10' + ' <a class="imdb" href="https://www.imdb.com/"><img class="imdb-image" src="assets/imdb_logo.png"></a>';
				}
				else {
					document.getElementById('rating-span').innerHTML = 'N/A' + ' <a class="imdb" href="https://www.imdb.com/"><img class="imdb-image" src="assets/imdb_logo.png"></a>';
				}

				document.getElementById('movie-poster')['src'] = 'images/' + element['Movie Name'].replaceAll(" ", "_").replaceAll(":", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("'", "").replaceAll("-", "").replaceAll(".", "").replaceAll("__", "_") + '/title_image.jpg';
				if (element['Trailer Link'] === undefined || element['Trailer Link'] == null) {
					document.getElementById('movie-trailer-div').innerHTML = '<img src="" alt="" id="movie-trailer">';
					document.getElementById('movie-trailer')['src'] = 'images/' + element['Movie Name'].replaceAll(" ", "_").replaceAll(":", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("'", "").replaceAll("-", "").replaceAll(".", "").replaceAll("__", "_") + '/trailer_image.jpg';
				}
				else {
					console.log(element['Trailer Link']);
					document.getElementById('movie-trailer-div').innerHTML = '<video width="100%" id="movie-trailer" controls muted autoplay src=""></video>';
					document.getElementById('movie-trailer')['src'] = element['Trailer Link'];
				}
				// document.getElementById('movie-trailer')['src'] = 'images/' + element['Movie Name'].replaceAll(" ", "_").replaceAll(":", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("'", "").replaceAll("-", "").replaceAll(".", "").replaceAll("__", "_") + '/trailer_image.jpg'
				document.getElementById('movie-name').innerHTML = element['Movie Name'] + '<hr>';
				if (element['Genre'].length != 0) {
					document.getElementById('genre').innerHTML = ('<b>Genre:</b> ' + element['Genre'] + '<hr>').replaceAll(',', ', ');
				}
				else {
					document.getElementById('genre').innerHTML = '<b>Genre:</b> N/A<hr>';
				}
				if (element['Directors'].length != 0) {
					document.getElementById('directors').innerHTML = ('<b>Directors:</b> ' + element['Directors']).replaceAll(',', ', ');
				}
				else {
					document.getElementById('directors').innerHTML = '<b>Directors:</b> N/A <hr>';
				}
				if (element['Cast'].length != 0) {
					document.getElementById('cast').innerHTML = ('<hr>' + '<b>Cast:</b> ' + element['Cast']).replaceAll(',', ', ');
				}
				else {
					document.getElementById('cast').innerHTML = '<b>Cast:</b> N/A <hr>';
				}
				if (element['Writers'].length != 0) {
					document.getElementById('writers').innerHTML = ('<hr>' + '<b>Writers:</b> ' + element['Writers']).replaceAll(',', ', ');
				}
				else {
					document.getElementById('writers').innerHTML = '<b>Writers:</b> N/A <hr>';
				}
				if (element['Languages'].length != 0) {
					document.getElementById('languages').innerHTML = ('<hr>' + '<b>Languages:</b> ' + element['Languages']).replaceAll(',', ', ');
				}
				else {
					document.getElementById('languages').innerHTML = '<b>Languages:</b> N/A <hr>';
				}
				if (element['Storyline'] != null) {
					document.getElementById('storyline').innerHTML = element['Storyline'];
				}
				else {
					document.getElementById('storyline').innerHTML = 'N/A';
				}
				let photo_divs = document.getElementsByClassName('photo-div');
				Array.from(photo_divs).forEach(function(photo_div, index) {
					photo_div.innerHTML = '<img src="images/' + element['Movie Name'].replaceAll(" ", "_").replaceAll(":", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("'", "").replaceAll("-", "").replaceAll(".", "").replaceAll("__", "_") + '/image_' + (index + 1) + '.jpg'  + '" alt="" class="photo">';
				})	
				return true;
			}
		})
	})
})

document.addEventListener('DOMContentLoaded', function() {

	fetch('http://localhost:3000/rating', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			'movie name': movie_name
		})
	})
	.then (response => {
		if (response.status == 200) {
			response.json().then(data => {
				clicked_number = parseInt(data['rating']) - 1;
				Array.from(document.getElementsByClassName('star')).forEach(function(star_image, index) {
					Array.from(document.getElementsByClassName('star-image')).forEach(function(star, star_number) {
						if (star_number <= clicked_number) {
							star.src = 'assets/golden-star.png';
						}
						else {
							star.src = 'assets/rate-image.png';
						}	
					})
				})
			})
			document.getElementById('rate-button').innerHTML = 'Change rating'
		}
		else if (response.status == 401) {
			
		}
	})
})

function levenshteinDistance(s, t) {
    const dp = Array.from(Array(s.length + 1), () => Array(t.length + 1).fill(0));

    for (let i = 0; i <= s.length; i++) {
        dp[i][0] = i;
    }

    for (let j = 0; j <= t.length; j++) {
        dp[0][j] = j;
    }

    for (let i = 1; i <= s.length; i++) {
        for (let j = 1; j <= t.length; j++) {
            const cost = s[i - 1] === t[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }

    return dp[s.length][t.length];
}

function preprocessText(text) {
	return text.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

document.getElementById('search-bar').addEventListener('keydown',function(event) {
	search(event);
})

function search(event){
	if (event.key == 'Enter') {
		if (document.getElementById('search-bar').value == '') {
			return;
		}
		let search = document.getElementById('search-bar').value;
		let minDistance = levenshteinDistance(search, 'The Dark Knight');
		let closestMatch = 'The Dark Knight';
		let includes = [];
		fetch('movies.json')
		.then(response => response.json())
		.then(data => {
			data.some(function(element, index) {
				if (preprocessText(element['Movie Name']).includes(preprocessText(search))) {
					includes.push(element['Movie Name']);
				}
				const distance = levenshteinDistance(preprocessText(search), preprocessText(element['Movie Name']));
				if (distance < minDistance) {
					minDistance = distance;
					closestMatch = element['Movie Name'];
				}
			})
			if (includes.length > 0) {
				window.location.href = 'movie.html?' + includes[0];
				return;
			}
			else if (minDistance/closestMatch.length < 0.6) {
				window.location.href = 'movie.html?' + closestMatch;
				return;
			}
			else {
				window.location.href = '404.html';
				return;
			}
		})
	}
}


document.getElementById('search-bar').addEventListener('input',function(event) {
	const search = document.getElementById('search-bar').value;
	const ul = document.getElementById('search-results');
	ul.innerHTML = '';
	if (search.length = 0) {
		return;
	}

	let includes = [];
	let minDistance = levenshteinDistance(search, 'The Dark Knight');
	let closestMatch = 'The Dark Knight';
	fetch('movies.json')
	.then(response => response.json())
	.then(data => {
		data.some(function(element, index) {
			if (preprocessText(element['Movie Name']).includes(preprocessText(search))) {
				includes.push(element['Movie Name']);
			}
			const distance = levenshteinDistance(search, element['Movie Name']);
			if (distance < minDistance) {
				minDistance = distance;
				closestMatch = element['Movie Name'];
			}
		})
		includes = [...new Set(includes)]
		if (minDistance/closestMatch.length < 0.6 && !includes.includes(closestMatch)) {
			includes.push(closestMatch)
		}
		if (includes.length > 5) {
			includes = includes.slice(0, 5);
		}
		includes.forEach(function(element, index) {
			const li = document.createElement('li');
			li.innerHTML = element;
			ul.appendChild(li);
			li.classList.add('search-item');
			li.addEventListener('click', function() {
				document.getElementById('search-bar').focus();
				document.getElementById('search-bar').value = this.innerHTML;
				document.getElementById('search-bar').dispatchEvent(new Event('input'));
			})
		})
	})
})








Array.from(document.getElementsByClassName('star')).forEach(function(star_image, index) {
	star_image.addEventListener('mouseover', function() {
		Array.from(document.getElementsByClassName('star-image')).forEach(function(star, star_number) {
			if (star_number <= index) {
				star.src = 'assets/golden-star.png';
			}
			else {
				star.src = 'assets/rate-image.png';
			}
		})
	})
})

Array.from(document.getElementsByClassName('star')).forEach(function(star_image, index) {
	star_image.addEventListener('mouseout', function() {
		Array.from(document.getElementsByClassName('star-image')).forEach(function(star, star_number) {
			if (star_number <= clicked_number) {
				star.src = 'assets/golden-star.png';
			}
			else {
				star.src = 'assets/rate-image.png';
			}
		})
	})
})

Array.from(document.getElementsByClassName('star')).forEach(function(star_image, index) {
	star_image.addEventListener('click', function() {
		clicked_number = index;
		Array.from(document.getElementsByClassName('star')).forEach(function(star) {
			star.removeEventListener('mouseout', function() {
			})
		})
		Array.from(document.getElementsByClassName('star-image')).forEach(function(star, star_number) {
			if (star_number <= index) {
				star.src = 'assets/golden-star.png';
			}
			else {
				star.src = 'assets/rate-image.png';
			}
		})
	})
})

document.getElementById('rate-button').addEventListener('click', function() {
	if (clicked_number == -1) {
		alert('Please rate the movie!');
		return;
	}
	fetch('http://localhost:3000/profile', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(async response => {
		if (response.status == 200) {
			fetch('http://localhost:3000/rate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'movie name': movie_name,
					'rating': clicked_number + 1
				})
			})
			.then(async response => {
				if (response.status == 201) {
					document.getElementById('rate-button').innerHTML = 'Change rating';
					alert('Rating changed to ' + (clicked_number + 1) + '/10');
				}
				else {
					alert(await response.text())
				}
			})
		}
		else if (response.status == 401) {
			alert(await response.text())
		}
	})
})

document.addEventListener('DOMContentLoaded', function() {
	const all_about_movie = document.getElementById('all-about-movie');
	const div_width = all_about_movie.offsetWidth + 'px';
	document.documentElement.style.setProperty('--div-width', div_width);
})

// let taps = 0;
// document.getElementById('movie-trailer-div').addEventListener('click', function() {
// 	let video = document.getElementById('movie-trailer-div').firstChild
// 	if (taps == 0) {
// 		console.log(taps)
// 		video.removeAttribute('muted');
// 		video.play();
// 	}
// 	else {
// 		video.pause();
// 	}
// 	taps += 1;
// })

