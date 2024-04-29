import json
import sys

with open('../movies.json') as f:
	data = json.load(f)

with open(sys.argv[1] + '.json') as f:
	rated_movies = json.load(f)

genres = {}
years = {}
languages = {}

unrated_movies = []
for movie in data:
	found = False
	for rated_movie in rated_movies:
		if rated_movie['movie name'] == movie['Movie Name']:
			found = True
			break
	if not found:
		unrated_movies.append(movie)

for rated_movie in rated_movies:
	for movie in data:
		if rated_movie['movie name'] == movie['Movie Name']:
			for genre in movie['Genre']:
				if genre in genres:
					genres[genre] = genres[genre] + int(rated_movie['rating'])
				else:
					genres[genre] = int(rated_movie['rating'])
			
			if movie['Year'] in years.keys():
				years[movie['Year']] = years[movie['Year']] + int(rated_movie['rating'])
			else:
				years[movie['Year']] = int(rated_movie['rating'])
			
			for language in movie['Languages']:
				if language in languages:
					languages[language] = languages[language] + int(rated_movie['rating'])  
				else:
					languages[language] = int(rated_movie['rating'])

			break

for genre in genres:
	genres[genre] = genres[genre] / len(rated_movies)
for year in years:
	years[year] = years[year] / len(rated_movies)
for language in languages:
	languages[language] = languages[language] / len(rated_movies)

genres = dict(sorted(genres.items(), key=lambda x: x[1], reverse=True))
years = dict(sorted(years.items(), key=lambda x: x[1], reverse=True))
languages = dict(sorted(languages.items(), key=lambda x: x[1], reverse=True))

print(genres)
print(years)
print(languages)

suggestions = []
for movie in unrated_movies:
	if languages[list(languages.keys())[0]] - languages[list(languages.keys())[1]] <= 4:
		if ((list(genres.keys())[0] in movie['Genre'] and list(genres.keys())[1] in movie['Genre']) or (list(genres.keys())[1] in movie['Genre'] and list(genres.keys())[2] in movie['Genre']) or (list(genres.keys())[0] in movie['Genre'] and list(genres.keys())[2] in movie['Genre'])) and (abs(int(list(years.keys())[0]) - int(movie['Year'])) <= 5 or abs(int(list(years.keys())[1]) - int(movie['Year'])) <= 5) and (list(languages.keys())[0] in movie['Languages'] or list(languages.keys())[1] in movie['Languages']) and movie['Movie Name'] not in suggestions:
			try:
				if list(genres.keys()).index('Animation') >= len(genres)/2 and 'Animation' in movie['Genre']:
					continue
			except:
				pass
			suggestions.append(movie['Movie Name'])
	else:
		if ((list(genres.keys())[0] in movie['Genre'] and list(genres.keys())[1] in movie['Genre']) or (list(genres.keys())[1] in movie['Genre'] and list(genres.keys())[2] in movie['Genre']) or (list(genres.keys())[0] in movie['Genre'] and list(genres.keys())[2] in movie['Genre'])) and (abs(int(list(years.keys())[0]) - int(movie['Year'])) <= 5 or abs(int(list(years.keys())[1]) - int(movie['Year'])) <= 5) and list(languages.keys())[0] in movie['Languages'] and movie['Movie Name'] not in suggestions:
			try:
				if list(genres.keys()).index('Animation') >= len(genres)/2 and 'Animation' in movie['Genre']:
					continue
			except:
				pass
			suggestions.append(movie['Movie Name'])


suggestions = [movie for movie in suggestions if next((True for d in data if d['Movie Name'] == movie and d['Rating'] != None), False)]

print(suggestions)
suggestions = sorted(suggestions, key=lambda x: next((movie['Rating'] for movie in data if movie['Movie Name'] == x), -1), reverse=True)

if len(suggestions) > 14:
	suggestions = suggestions[:14]

with open(sys.argv[1] + 'suggestions.json', 'w') as f:
	json.dump(suggestions, f, indent=4)
