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

// database
const pool = require("./dbPool.js");
const mysql = require('mysql');

// bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const express = require('express');
const fetch = require("node-fetch"); // npm i node-fetch@2.6; allows to fetch data from web api's
const app = express();

// sessions
const session = require('express-session'); 
// https://github.com/expressjs/session#readme
app.set('trust proxy', 1) // trust first
app.use(session({
  secret: 'secret_key',  // secret can be whatever you want
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

// use for parsing data from a form using the POST method
app.use(express.urlencoded({extended:true})); 

app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static("public"));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// routes
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

//process sign-up request
app.post("/user/new", async function(req, res) {
  let fName = req.body.firstName;
  let lName = req.body.lastName;
  let email = req.body.emailAddress.toLowerCase();
  let password = req.body.password;
  let verifyPassword = req.body.confirmPassword;
  let message = "";

  // verify passwords match
  if (password == verifyPassword) {
    // verify email address does not already exist in database
    let sql = `SELECT * FROM pf_users WHERE email = ?`;
    let data = await executeSQL(sql, [email]);
    if (data.length > 0) {
      message = "Email address already exists! Please try again.";
    } else {
      // generate bcrypted password
      let bcryptPassword = generateBcrypt(password);
      let sql = `INSERT INTO pf_users (firstName, lastName, email, password)
                    VALUES (?, ?, ?, ? )`;
      let params = [fName, lName, email, bcryptPassword];
      await executeSQL(sql, params);
      message = "Sign up successful! Please sign in. ";
    }
  } else {
    message = "Passwords do not match! Please try again. ";
  }
  res.render('index', {message: message});
});

// plan text password -> bcrypt password
function generateBcrypt(plainTextPassword) {
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(plainTextPassword, salt);
  return hash;
}

// process login request
app.post("/user/login", async function(req, res) {
  let email = req.body.emailAddress.toLowerCase();
  let password = req.body.password;
  let passwordHash = "";
  let message = "";

  console.log(email);
  
  let sql = `SELECT * FROM pf_users WHERE email = ?`;
  let data = await executeSQL(sql, [email]);

  // verify username with that email address exists
  if (data.length > 0) {
    passwordHash = data[0].password;
    const matchPassword = await bcrypt.compare(password, passwordHash);
    console.log(matchPassword);

    // verify correct password
    if (matchPassword) {
      req.session.authenticated = true;
      res.locals.loggedIn = await req.session.authenticated;
      req.session.username = data[0].firstName + " " + data[0].lastName;
      req.session.userId = data[0].userId;
      message = `Welcome back, ${req.session.username}! `;
    } else {
      message = "Incorrect Password  ";
    }
  } else {
    message = "Email address not found  ";
  }
  res.render('index', {message:message});
});

// user log out
app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  req.session.destroy();   // remove the session, including all variables
  res.redirect('/');
});

// local API
app.get('/api/signup/profilePhotos', async function (req, res) {
  let url = 
  "https://api.unsplash.com/photos/random/?client_id=7756a1e81f817c186cf57294e1c19b37b49c54b8f34e7c499ee0ce5cd86cd16e&featured=true&query=animals";
  let response = await fetch(url);
  let data = await response.json();
  let imageUrl = data.urls.small;
  //console.log(imageUrl);
  res.send({imageUrl});
});

// OpenAI response
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


 // Functions
async function executeSQL(sql, params) {
  return new Promise(function (resolve, reject) {
    // promise will return a value in the future
    pool.query(sql, params, function (err, rows, fields) {
      if (err) throw err;
      resolve(rows); // returns the values
    });
  });
}

//middleware function for the authentication process 
function isAuthenticated(req, res, next) {
  if (req.session.authenticated) {
    next();
  } else {
    res.redirect('/');
  }
}

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