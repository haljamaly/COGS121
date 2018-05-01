/*
 * Here-n-There:
 * COGS121 course project Spring 2018
 * Author: Shuyuan Ma, Hasan Jamaly, Dominic Spencer
 */
const express = require('express');
const flash = require('express-flash-2');
const nunjucks = require('nunjucks');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('app.db');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// allow post method handeling
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// all static files (html, js, css, img) goes into /src/
app.use(express.static('src'));

// random secret key
app.use(cookieParser('Y76(&@GB@#H@(&))'));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized:true
}));

// use the flash middleware
app.use(flash());

// setup nunjuck template
nunjucks.configure('src/html', {
  autoescape: true,
  express: app
});

/*
 * handle routes
 */
app.get('/', function(req, res) {
  let posts = [];
  db.serialize(function() {
    db.each("SELECT * FROM posts", function(err, row) {
      posts.push(row);
    }, function() {
      // All done fetching records, render response
      console.log(posts);
      res.render("index.html", {posts: posts, title: 'home'});
    });
  });
});

app.get('/newpost', function(req, res) {
  res.render('newpost.html', { title: 'posts' });
});

app.get('/locations', function(req, res) {
  res.render('locations.html', { title: 'locations' });
});

app.get('/profile', function(req, res) {
  res.render('profile.html', { title: 'profile' });
});


app.get('/about', function(req, res) {
  res.render('about.html', { title: 'about' });
});

// for testing flash message
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to res.flash().
  // for types, please refer https://getbootstrap.com/docs/4.0/components/alerts/
  res.flash('danger', 'Flash danger is back!');
  res.flash('info', 'Flash info is back!');
  res.redirect('/');
});

app.get('/locations/:location', (req, res) => {
  let posts = [];
  const nameToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':userid' above
  let val = '';
  db.serialize(function() {
    const nameToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':userid' above
    db.each("SELECT * FROM posts where location = '" + nameToLookup + "' COLLATE NOCASE", function(err, row) {
      posts.push(row);
    }, function() {
      // All done fetching records, render response;
      res.send(posts);
      //  res.render("index.html", {posts: posts, title: 'home'});
    });
  });
});

/*
 * handle GoogleYolo Login
 */
app.post('/idTokenLogin', (req, res) => {
  res.flash('success', 'You have Logged-in!');
  console.log('idTokenLogin:', req.body);
});

/*
 * handle logout
 */
app.post('/logout', function(req, res) {
  console.log('logout.');
  // TODO: clear session
  res.redirect('/');
});

/*
 * handle data access
 */
app.get('/users', (req, res) => {
  let names = [];
  db.serialize(function() {
      db.each("SELECT name FROM users", function(err, row) {
          names.push(row);
      }, function() {
          // All done fetching records, render response;
          res.send(names);
        //  res.render("index.html", {posts: posts, title: 'home'});
      });
    });
});

app.get('/users/:username', (req, res) => {
  let posts = [];
  const nameToLookup = req.params.username.toLowerCase().split('_').join(' '); // matches ':userid' above
  let val = '';
  db.serialize(function() {
    const nameToLookup = req.params.username.toLowerCase().split('_').join(' '); // matches ':userid' above
      db.each("SELECT * FROM users where name = '" + nameToLookup + "' COLLATE NOCASE", function(err, row) {
          posts.push(row);
      }, function() {
          // All done fetching records, render response;
          res.send(posts);
        //  res.render("index.html", {posts: posts, title: 'home'});
      });
    });
});

app.get('/post/:postid', (req, res) => {
  let post = [];
  let val = '';
  db.serialize(function() {
    const postid = req.params.postid; // matches ':userid' above
      db.each("SELECT * FROM posts where pid = '" + postid + "'", function(err, row) {
          post.push(row);
      }, function() {
        db.each("SELECT name FROM users where uid = '" + post[0].author + "'", function(err, row) {
          post[0].author = row.name;
        }, function() {
          // All done fetching records, render response;
          res.render("post.html", post[0]);
        //  res.render("index.html", {posts: posts, title: 'home'});
      });
    });
  });
});

app.post('/newpost', (req, res) => {
  console.log(req.body);

  db.run(
    'INSERT INTO posts VALUES (NULL, $title, $img, $time, $author, $location, $content)',
    // parameters to SQL query:
    {
      $title: req.body.name,
      $location: req.body.location,
      $img: req.body.image,
      $content: req.body.body,
      $time: req.body.time,
      $author: req.body.author
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
        res.send({message: 'error in app.post(/newpost)'});
      } else {
        res.send({message: 'successfully run app.post(/newpost)'});
      }
    }
  );
});

// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
