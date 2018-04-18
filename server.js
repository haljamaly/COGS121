/*
 * Here-n-There:
 * COGS121 course project Spring 2018
 * Author: Shuyuan Ma, Hasan Jamaly, Dominic Spencer
 */
const express = require('express');
const app = express();
const path = require('path');

// all static files (html, js, css, img) goes into /src/
app.use(express.static('src'));

const fakeDatabase = {
  'shuyuan': {uid: 1,
              uname: 'Shuyuan',
              profile_img: 'img/shuyuan.jpg',
              been_to: ['Fuji Mountain']},
  'hasan':   {uid: 2,
              uname: 'Hasan',
              profile_img: 'img/hasan.jpg',
              been_to: ['Fuji Mountain', 'Los Angelos']},
  'dominic': {uid: 3,
              uname: 'Dominic',
              profile_img: 'img/dom.jpg',
              been_to: ['Los Angelos']}
};


app.get('/', (req, res) => {
  console.log("index page");
  res.sendFile(path.join(__dirname+'/src/html/index.html'));
});

app.get('/users', (req, res) => {
  const allUsernames = Object.keys(fakeDatabase); // returns a list of object keys
  console.log('allUsernames is:', allUsernames);
  res.send(allUsernames);
});


app.get('/users/:userid', (req, res) => {
  const nameToLookup = req.params.userid; // matches ':userid' above
  const val = fakeDatabase[nameToLookup];
  console.log(nameToLookup, '->', val); // for debugging
  if (val) {
    res.send(val);
  } else {
    res.send({}); // failed, so return an empty object instead of undefined
  }
});

// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
