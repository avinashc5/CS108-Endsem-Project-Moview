from selenium import webdriver # pip install selenium; pip install webdriver_manager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options # pip install chromedriver
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os
import time
import requests # pip install requests
import json 

url = 'https://www.imdb.com/search/title/?title_type=feature&num_votes=25000,&genres=mystery&sort=user_rating,desc'

options = Options()
options.add_argument('--headless')
options.add_argument("--window-size=1920,1080")
user_agent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.50 Safari/537.36'
options.add_argument(f'user-agent={user_agent}')

driver = webdriver.Chrome(options=options) # open browser

driver.get(url) # go to url
driver.implicitly_wait(10) # wait for 10 seconds before throwing an exception
driver.maximize_window()

actions = ActionChains(driver)

# To move to this folder for storing all the images
image_folder_name = 'images'

os.chdir('..') # Move out of webscraper

# Make an images folder if it doesnt exist
try:
	os.mkdir(image_folder_name)
except FileExistsError:
	pass

os.chdir('./' + image_folder_name)

try:
	_50_more = driver.find_element(By.CLASS_NAME, 'ipc-see-more__text')
	actions = ActionChains(driver)
	actions.move_to_element(_50_more)
	actions.click(_50_more).perform()
	WebDriverWait(driver, 10).until(lambda driver: (len(driver.find_elements(By.XPATH, '//div[@class="ipc-metadata-list-summary-item__tc"]')) == 100)) # Change this to explicit wait
except:
	pass

list_of_movies = []
# find the 'more info' buttons
titles = driver.find_elements(By.XPATH, '//a[@class="ipc-title-link-wrapper"]')
title_links = []
for title in titles:
	title_links.append(title.get_attribute('href'))
try:
	title_links = title_links[:100]
except:
	pass

print(len(title_links))
x=1

for title_link in title_links:
	driver.get(title_link)
	# WebDriverWait(driver, 20).until(EC.visibility_of_all_elements_located((By.XPATH, '//div[@data-testid="storyline-plot-summary"]')))
	try:
		driver.implicitly_wait(10) # wait for 10 seconds before throwing an exception
	except:
		continue
	# To see which movie we are on
	print(x)
	x = x+1
	


	for i in range(15):
		driver.find_element(By.CSS_SELECTOR, 'body').send_keys(Keys.PAGE_DOWN)
		time.sleep(0.5)
	driver.find_element(By.CSS_SELECTOR, 'body').send_keys(Keys.CONTROL + Keys.HOME)
	try:
		movie_name = driver.find_element(By.XPATH, '//span[@class="hero__primary-text"]').text
	except:
		continue
	year = None
	ad_cat = None
	duration = None
	try:
		year_ad_cat_duration = driver.find_element(By.XPATH, '//ul[@class="ipc-inline-list ipc-inline-list--show-dividers sc-d8941411-2 cdJsTz baseAlt"]').text.split('\n')
	except:
		year = None
		ad_cat = None
		duration = None
	try:
		year = year_ad_cat_duration[0]
	except:
		year = None
	try:
		ad_cat = None
		duration = None
		if len(year_ad_cat_duration) == 3:
			ad_cat = year_ad_cat_duration[1]
			duration = year_ad_cat_duration[2]
		else:
			duration = year_ad_cat_duration[1]
	except:
		ad_cat = None
		duration = None
	try:
		rating = driver.find_element(By.XPATH, '//div[@data-testid="hero-rating-bar__aggregate-rating__score"]').text.split('\n')[0]
	except:
		rating = None
	try:
		director_writers_cast = driver.find_elements(By.XPATH, '//ul[@class="ipc-inline-list ipc-inline-list--show-dividers ipc-inline-list--inline ipc-metadata-list-item__list-content baseAlt"]')
		try:
			directors_elements = director_writers_cast[0].find_elements(By.TAG_NAME, 'a')
			directors = []
			for director in directors_elements:
				directors.append(director.text)
		except:
			directors = []
		try:
			writers_elements = director_writers_cast[1].find_elements(By.TAG_NAME, 'a')
			writers = []
			for writer in writers_elements:
				writers.append(writer.text)
		except:
			writers = []
		try:
			cast_elements = director_writers_cast[2].find_elements(By.TAG_NAME, 'a')
			cast = []
			for actor in cast_elements:
				cast.append(actor.text)
		except:
			cast = []
	except:
		directors = []
		writers = []
		cast = []
	# Storyline only works when the window is open
	try:
		WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.XPATH, '//div[@data-testid="storyline-plot-summary"]')))
		storyline = driver.find_element(By.XPATH, '//div[@data-testid="storyline-plot-summary"]').text
	except:
		storyline = None

	try:
		genre_list = driver.find_element(By.XPATH, '//li[@data-testid="storyline-genres"]').find_elements(By.TAG_NAME, 'a')
		genre = []
		for item in genre_list:
			genre.append(item.text)
	except:
		genre = []

	try:
		languages = []
		languages_list = driver.find_element(By.XPATH, '//li[@data-testid="title-details-languages"]').find_elements(By.TAG_NAME, 'a')
		for language in languages_list:
			languages.append(language.text)
	except:
		languages = []
	
	try:
		trailer_link = driver.find_element(By.XPATH, '//video[@class="jw-video jw-reset"]').get_attribute('src')
	except:
		trailer_link = None

	# Create folder for images of each movie
	foldername = movie_name.replace(" ", "_").replace(":", "").replace("(", "").replace(")", "").replace("/", "").replace("'", "").replace("-", "").replace(".", "").replace("__", "_")
	try:
		os.mkdir(foldername)
	except FileExistsError:
		pass
	os.chdir(foldername)

	# Images
	# To store all the links of the required images and then going for each image one by one
	# poster, trailer image, then 5 photos
	title_image_link = driver.find_element(By.XPATH, '//div[@class="ipc-media ipc-media--poster-27x40 ipc-image-media-ratio--poster-27x40 ipc-media--baseAlt ipc-media--poster-l ipc-poster__poster-image ipc-media__img"]/img').get_attribute('src')
	driver.get(title_image_link)
	driver.find_element(By.TAG_NAME, 'img').get_attribute('src')
	image_name = 'title_image'
	with open(image_name + '.jpg', 'wb') as f:
		im = requests.get(title_image_link)
		f.write(im.content)
	image_location = image_folder_name + '/' + foldername + '/'
	driver.back()
	
	try:
		trailer_img_link = driver.find_element(By.XPATH, '//img[contains(@alt, "Trailer")]').get_attribute('src')
		driver.get(trailer_img_link)
		driver.find_element(By.TAG_NAME, 'img').get_attribute('src')
		image_name = 'trailer_image'
		with open(image_name + '.jpg', 'wb') as f:
			im = requests.get(trailer_img_link)
			f.write(im.content)

		driver.back()
	except:
		image_name = 'trailer_image'
		with open(image_name + '.jpg', 'wb') as f:
			im = requests.get('https://www.foodnavigator.com/var/wrbm_gb_food_pharma/storage/images/_aliases/news_large/9/6/0/9/239069-6-eng-GB/Appetite-Learning-SIC-Food-20162.jpg')
			f.write(im.content)
	
	# 5 images
	links = []
	number_of_photos = 5
	for i in range(1, 7):
		datatestid = 'photos-image-overlay-' + str(i)
		try:
			link = driver.find_element(By.XPATH, f'//a[@data-testid="{datatestid}"]').get_attribute('href')
			links.append(link)
		except:
			number_of_photos = i - 2
			break
	for i in range(1, number_of_photos + 1):
		driver.get(links[i])
		driver.implicitly_wait(10)
		image_link = driver.find_element(By.TAG_NAME, 'img').get_attribute('src')
		image_name = 'image_' + str(i)
		with open(image_name + '.jpg', 'wb') as f:
			im = requests.get(image_link)
			f.write(im.content)

	os.chdir('..')
	
	list_of_movies.append({
		'Movie Name': movie_name,
		'Year': year,
		'Ad Cat': ad_cat,
		'Duration': duration,
		'Rating': rating,
		'Cast': cast,
		'Directors': directors,
		'Writers': writers,
		'Storyline': storyline,
		'Genre': genre,
		'Languages': languages,
		'Image Location': image_location,
		'Trailer Link': trailer_link
	})

os.chdir('..') # Move out of images

try:
	with open('movies.json', 'r') as f:
		data = json.load(f)

# Take union of data and list_of_movies
	def dict_equal(dict1, dict2):
		return all(key in dict2 and dict2[key] == value for key, value in dict1.items())
	union_list = data.copy()
	union_list.extend([d2 for d2 in list_of_movies if not any(dict_equal(d1, d2) for d1 in union_list)])

	# Write union_list to movies.json
	with open('movies.json', 'w') as f:
		json.dump(union_list, indent = 4, fp = f)
# If movies.json does not exist or is empty
except json.decoder.JSONDecodeError:
	with open('movies.json', 'w') as f:
		json.dump(list_of_movies, indent = 4, fp = f)

except:
	with open('mystery_movies.json', 'w') as f:
		json.dump(list_of_movies, indent = 4, fp = f)