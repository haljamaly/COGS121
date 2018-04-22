/*
 * Here-n-There:
 * COGS121 course project Spring 2018
 * Author: Shuyuan Ma, Hasan Jamaly, Dominic Spencer
 */
const express = require('express');
const app = express();
const path = require('path');
const nunjucks = require('nunjucks');

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

// setup nunjuck template
nunjucks.configure('src/html', {
    autoescape: true,
    express: app
});

/*
 * handle routes
 */
app.get('/', function(req, res) {
    res.render('index.html', { title: 'home' });
});

app.get('/posts', function(req, res) {
    res.render('posts.html', { title: 'posts' });
});

app.get('/locations', function(req, res) {
    res.render('locations.html', { title: 'locations' });
});

app.get('/profile', function(req, res) {
    res.render('profile.html', { title: 'profile' });
});

app.get('/login', function(req, res) {
    res.render('login.html', { title: 'login' });
});

app.get('/about', function(req, res) {
    res.render('about.html', { title: 'about' });
});


/*
 * handle data access
 */
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
