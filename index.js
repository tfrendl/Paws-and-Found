const baseUrl ='https://api.thedogapi.com/v1/breeds';
const key = 'live_2ePwG6Vr7gnUJfkRxf7WRSW6wKZNaX25WXemQm6XbVdMqXuc8t4oOar8JOt1o1yM';

const catBaseUrl = 'https://api.thecatapi.com/v1/breeds';
const catKey = 'live_VtZnItKb31weSk4mWWZfmI9k5g3QgjqA0IqvD565GQy6itmqlZ7cw2z5wcvj3TAH';


const rescueGroupUrl = "https://api.rescuegroups.org/http/v2.json";
const rgKey = '3eA6vSco';

const dotenv = require('dotenv');
dotenv.config();

// OpenAI
const OpenAI = require("openai");




const express = require('express');
// const fetch = require("node-fetch); ") // npm i node-fetch@2.6; allows to fetch data from web api's
const app = express();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static("public"));


app.get('/', async (req, res) => {
  res.render('index');
});

app.get('/chatbot', async (req, res) => {
  res.render('chatbot');
});


app.get('/adoptableDogs', (req, res) => {
  res.render('adoptableDogs');
});

app.get('/adoptableCats', async (req, res) => {
  let response = await fetch(rescueGroupUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apikey: "3eA6vSco",
      objectType: "animals",
      objectAction: "publicSearch",
      search: {
        resultStart: 0,
        resultLimit: 20,
        resultSort: "animalID",
        resultOrder: "asc",
        calcFoundRows: "Yes", 
        filters: [ 
          {
            fieldName: "animalSpecies",
            operation: "equals",
            criteria: "cat"
          },
          {
            fieldName: "animalGeneralSizePotential",
            operation: 'equals',
            criteria: 'small'
          }
        ]
      },
      fields: ['animalID', 'animalOrgID', 'animalName', 'animalBreed']
      })
    });
  
  let data = await response.json();
  if (data.status === 'error') {
    console.error(data.messages);
  }
  console.log(data.foundRows);
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

 app.post('/assistantResponse', async (req, res) => {
   const userQuestion = req.body.question; 
   console.log("Received question", userQuestion);

   try {
     const response = await openai.chat.completions.create({
       model: 'gpt-3.5-turbo',
       messages: [
         { role: 'system', content: "You are a helpful assistant for a website that gives information about cat breeds and dog breeds. Provide helpful information to inform users what kind of pet would be good for them." },
         { role: 'user', content: userQuestion },
       ],
     });
 
     const assistantResponse = response.choices[0].message.content;
    // console.log(assistantResponse);
     res.json({ response: assistantResponse });
   } catch (error) {
     console.error("Error fetching AI response:",error);
   }
  });

//   try {
//     const completion = await openai.createCompletion({
//       model: "gpt-4o-mini-2024-07-18",
//       messages: [
//         { role: "system", content: "You are a helpful assistant for a website that gives information about cat breeds and dog breeds. Provide helpful information to inform users what kind of pet would be good for them." },
//         { role: "user", content: `${userQuestion}`}
//         ],
//     });

//     const assistantResponse = completion.choices[0].text.trim();
//     res.json({response: assistantResponse});
//   } catch (error) {
//     console.error("Error communicating with openAI:", error);
//   }
//       // return response.choices[0].message.content;
// });


 let port = process.env.PORT || 3000;

 app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
 });




  

// enter "npx nodemon index" to not need to restart app every time



  //   let assistantResponse = completion.choices[0].message.content;
  //   res.send(assistantResponse);
  // } catch(error) {
  //   console.error('Error:', error);
  // }
  //return completion.choices[0].message.content;
  // send POST request to API, get response
  // fetch(API_URL, requestOptions).then(res => res.json()).then(data => {
  //   messageElement.textContent = data.choices[0].message.content;
  // }).catch((error) => {
  //   messageElement.classList.add("error");
  //   messageElement.textContent = "Something went wrong! Please try again";
  // }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));