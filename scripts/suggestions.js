if(performance.navigation.type == 2){
	location.reload(true);
}

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

function suggest() {
	fetch('http://localhost:3000/shouldsuggest', {
		method: 'GET',
		headers: {
			'Content-Type': 'text/plain'
		}
	})
	.then(async response => {
		if (response.status == 200) {
			if (await response.text() == 'true') {
				document.getElementById('suggestions-container').innerHTML = '<div class="first-message">Here are some movies you might like.</div>';
				let gif = document.createElement('div');
				gif.classList.add('gif-container');
				document.getElementById('suggestions-container').appendChild(gif);
				let gif_image = document.createElement('img');
				gif_image.src = 'assets/loading_withoutbg.gif';
				gif_image.classList.add('gif');
				gif.appendChild(gif_image);
				const movies = await (await fetch('http://localhost:3000/suggestions', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
					}
				})).json();
				
				const movie_suggestions = document.createElement('div');
				movie_suggestions.classList.add('movie-suggestions');
				movie_suggestions.id = 'movie-suggestions';
				document.getElementById('suggestions-container').appendChild(movie_suggestions);

				Promise.all(movies.map(sugg_movie => {
					return fetch('movies.json')
					.then(response => response.json())
					.then(data => {
						for (element of data) {
							if (element['Movie Name'] == sugg_movie) {
								let movie = document.createElement('div');
								movie.classList.add('movie');

								let movie_img = document.createElement('div');
								movie_img.classList.add('movie-img');

								let image = document.createElement('img');
								image.classList.add('image');
								image.src = image['src'] = 'images/' + element['Movie Name'].replaceAll(" ", "_").replaceAll(":", "").replaceAll("(", "").replaceAll(")", "").replaceAll("/", "").replaceAll("'", "").replaceAll("-", "").replaceAll(".", "").replaceAll("__", "_") + '/title_image.jpg';;

								let movie_title = document.createElement('div');
								movie_title.classList.add('movie-title');

								let rating_rate = document.createElement('div');
								rating_rate.classList.add("rating-rate");
								
								let movie_rating = document.createElement('div');
								movie_rating.classList.add("movie-rating");
								movie_rating.innerHTML = element['Rating'] + '/10';
								
								let rate = document.createElement('div');
								rate.classList.add("rate");
								
								let rate_image = document.createElement('img');
								rate_image.classList.add("rate-image");
								rate_image['src'] = "assets/golden-star.png";
								
								let movie_name = document.createElement('div');
								movie_name.classList.add("movie-name");
								movie_name.innerHTML = element['Movie Name'];

								rating_rate.appendChild(movie_rating);
								rating_rate.appendChild(rate);
								rate.appendChild(rate_image);
								movie_title.appendChild(rating_rate);
								movie_title.appendChild(movie_name);
								movie_img.appendChild(image);
								movie.appendChild(movie_img);
								movie.appendChild(movie_title);
								movie.addEventListener('click', () => {
									window.location.href = `movie.html?${movie_name.innerHTML}`;
								})
								return movie;
							}
						}
					})
				}))
				.then(movies => movies.forEach(movie => {
					movie_suggestions.appendChild(movie)
				}));
				gif.style.display = 'none';
			}
		}
		else {
			document.getElementById('suggestions-container').innerHTML = '<div class="first-message">Rate more than <span class="five">5</span> movies to get suggestions</div>';
			return;
		}
	})
}

document.addEventListener('DOMContentLoaded', function(){
	fetch('http://localhost:3000/profile', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(async response => {
			if (response.status == 401) {
				document.getElementById('suggestions-container').innerHTML = '<div class="first-message">Rate more than <span class="five">5</span> movies to get suggestions</div>';
			alert('Please sign in first!');
			return;
		}
		else {
			suggest();
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
		console.log(search);
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


