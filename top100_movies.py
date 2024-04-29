from selenium import webdriver # pip install selenium; pip install webdriver_manager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options # pip install chromedriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import requests # pip install requests
import json 


url = 'https://www.imdb.com/search/title/?groups=top_100&sort=user_rating,desc'

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('--no-sandbox')
options.add_experimental_option('detach', True)

driver = webdriver.Chrome() # open browser

driver.get(url) # go to url
driver.implicitly_wait(10) # wait for 10 seconds before throwing an exception
driver.maximize_window()

try:
	_50_more = driver.find_element(By.CLASS_NAME, 'ipc-see-more__text')
	actions = ActionChains(driver)
	actions.move_to_element(_50_more)
	actions.click(_50_more).perform()
	WebDriverWait(driver, 10).until(lambda driver: (len(driver.find_elements(By.XPATH, '//div[@class="ipc-metadata-list-summary-item__tc"]')) == 100)) # Change this to explicit wait
except:
	if len(driver.find_elements(By.XPATH, '//div[@class="ipc-metadata-list-summary-item__tc"]')) >= 100:
		pass
	else:
		print('Something went wrong. Please check the code and try again.')
		exit()
try:	
	os.mkdir('images')
except FileExistsError:
	pass

os.chdir('./images')

list_of_movies = []
# find the 'more info' buttons
buttons = driver.find_elements(By.XPATH, '//button[starts-with(@aria-label, "See more information about")]')
i = 1
for button in buttons:
	# only want 100 movies
	if i == 101:
		break

	# click the 'more info' button
	actions.move_to_element(button)
	actions.click(button).perform()
	# wait until the div occurs on the screen
	WebDriverWait(driver, 10).until(EC.element_to_be_clickable(driver.find_element(By.XPATH, '//button[@class="ipc-rate-button sc-a78ec4e3-5 jLbmEK ipc-rate-button--unrated ipc-rate-button--baseAlt"]')))

	movie = driver.find_element(By.XPATH, '//div[@class="ipc-promptable-base__focus-lock"]') # the div containing the movie info

	# Movie Name
	try:
		movie_name = movie.find_element(By.XPATH, '//h3[@class="ipc-title__text prompt-title-text"]').text
	except:
		continue

	# Year, Duration, Advisory Category, Genre
	try:
		year_duration_ad_cat_genre = movie.find_elements(By.XPATH, '//ul[@class="ipc-inline-list ipc-inline-list--show-dividers ipc-inline-list--no-wrap ipc-inline-list--inline baseAlt"]')
		# Year, Duration, Advisory Category
		try:
			year_duration_ad_cat = year_duration_ad_cat_genre[0].find_elements(By.TAG_NAME, 'li')

			# Year
			try:
				year = year_duration_ad_cat[0].text
			except:
				year = None

			# Duration
			try:
				duration = year_duration_ad_cat[1].text
			except:
				duration = None

			# Advisory Category
			try:
				ad_cat = year_duration_ad_cat[2].text
			except:
				ad_cat = None
		except:
			year = None
			duration = None
			ad_cat = None

		# Genre
		try:
			genre = []
			genre_elements = year_duration_ad_cat_genre[1].find_elements(By.TAG_NAME, 'li')
			for item in genre_elements:
				genre.append(item.text)
		except:
			genre = []
	except:
		year = None
		duration = None
		ad_cat = None
		genre = None

	# Rating
	try:
		rating = movie.find_element(By.XPATH, '//span[@class="ipc-rating-star ipc-rating-star--baseAlt ipc-rating-star--imdb btp_rt_ds"]').text.split('\n')[0]
	except:
		rating = None
	
	# Summary
	try:
		summary = movie.find_element(By.XPATH, '//div[@class="sc-d3701649-2 cPgMft"]').text
	except:
		summary = None
	
	# Directors and Cast
	try:
		director_cast = movie.find_elements(By.XPATH, '//div[@class="sc-9bca7e5d-2 itmyuK"]')

		# Directors
		try:
			director_elements = director_cast[0].find_elements(By.TAG_NAME, 'li')
			directors = []
			for item in director_elements:
				directors.append(item.text)
		except:
			directors = []
		
		# Cast
		try:
			cast_elements = director_cast[1].find_elements(By.TAG_NAME, 'li')
			cast = []
			for item in cast_elements:
				cast.append(item.text)
		except:
			cast = []
	except:
		directors = []
		cast = []
	
	# Image
	try:
		image_link = movie.find_element(By.TAG_NAME, 'img').get_attribute('src')
		name = movie_name.replace(" ", "_").replace(":", "").replace("(", "").replace(")", "").replace("/", "").replace("'", "").replace("-", "").replace(".", "").replace("__", "_")
		with open(name + '.jpg', 'wb') as f:
			im = requests.get(image_link)
			f.write(im.content)
		image_location = os.path.join(os.getcwd(), name + '.jpg')
	except:
		image_location = None

	movie_details = {
		'Movie Name': movie_name,
		'Year': year,
		'Duration': duration,
		'Advisory Category': ad_cat,
		'Genre': genre,
		'Rating': rating,
		'Summary': summary,
		'Directors': directors,
		'Cast': cast,
		'Image Location': image_location
	}

	list_of_movies.append(movie_details)

	# Close the div containing the movie info
	close_button = driver.find_element(By.CSS_SELECTOR, 'button[aria-label="Close Prompt"]')
	actions.move_to_element(close_button)
	actions.click(close_button).perform()

	i += 1

os.chdir('../')
# Store the scraped data in a json file
with open('data_.json', 'w') as f:
	json.dump(list_of_movies, indent = 4, fp = f)