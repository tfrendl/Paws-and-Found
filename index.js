const baseUrl ='https://api.thedogapi.com/v1/breeds';
const key = 'live_2ePwG6Vr7gnUJfkRxf7WRSW6wKZNaX25WXemQm6XbVdMqXuc8t4oOar8JOt1o1yM';

const catBaseUrl = 'https://api.thecatapi.com/v1/breeds';
const catKey = 'live_VtZnItKb31weSk4mWWZfmI9k5g3QgjqA0IqvD565GQy6itmqlZ7cw2z5wcvj3TAH';

const express = require('express');
// const fetch = require("node-fetch); ") // npm i node-fetch@2.6; allows to fetch data from web api's
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/adoptableDogs', (req, res) => {
  res.render('adoptableDogs');
});

app.get('/adoptableCats', (req, res) => {
  res.render('adoptableCats');
});

app.get('/viewAllDogs', async (req, res) => {
  let response = await fetch(baseUrl, {
    headers: {
      'x-api-key': key
    }
  });
  let data = await response.json();
  
  res.render('viewAllDogs', {dogData: data});
});

app.get('/aboutCats', async (req, res) => {
  let response = await fetch(catBaseUrl, {
    headers: {
      'x-api-key': catKey
    }
  });
  let data = await response.json();

  res.render('aboutCats', {catData: data});
});

app.listen(3000, () => {
  console.log('server started');
});


// enter "npx nodemon index" to not need to restart app every time

