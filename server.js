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

// validate google id id token
// https://developers.google.com/identity/one-tap/web/idtoken-auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '687083663797-h6rk9pcjjm2ac1kib7kcbbjqpqc2ipcg.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  console.log('token veryfied');
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
}


// all static files (html, js, css, img) goes into /src/
app.use(express.static('src'));

// random secret key
app.use(cookieParser('Y76(&@GB@#H@(&))'));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized:true,
  cookie: {
    maxAge: 30 * 60 * 1000 // expire time in ms
  }
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
  const posts = [];
  db.serialize(function() {
    db.each("SELECT * FROM posts", function(err, row) {
      posts.push(row);
    }, function() {
      // All done fetching records, render response
      // console.log(posts);
      const signedInUser = req.session.signedInUser;
      const isSignedIn = !!signedInUser;
      const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
      res.render("index.html", {posts: posts, title: 'home', avatar: avatar, isSignedIn: isSignedIn || 0});
    });
  });
});

app.get('/newpost', function(req, res) {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
  res.render('newpost.html', { title: 'newposts', avatar: avatar, isSignedIn: isSignedIn || 0});
});

app.get('/locations', function(req, res) {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
  res.render('locations.html', { title: 'locations', avatar: avatar, isSignedIn: isSignedIn || 0});
});

app.get('/profile', function(req, res) {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
  res.render('profile.html', { title: 'profile', avatar: avatar, isSignedIn: isSignedIn || 0});
});


app.get('/about', function(req, res) {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
  res.render('about.html', { title: 'about', avatar: avatar, isSignedIn: isSignedIn || 0});
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
  const locationToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':location' above
  let val = '';
  db.serialize(function() {
    db.each("SELECT * FROM posts where location = '" + locationToLookup + "' COLLATE NOCASE", function(err, row) {
      posts.push(row);
    }, function() {
      // All done fetching records, render response;
      res.send(posts);
      //  res.render("index.html", {posts: posts, title: 'home'});
    });
  });
});

/*
 * handle Google sign-in
 * https://developers.google.com/identity/sign-in/web/sign-in
 */
app.post('/idTokenLogin', (req, res) => {
  const idToken = req.body.idToken;
  const google_id = req.body.google_id;
  // verify the token
  verify(idToken).catch(console.error).then((e) => {
    console.log('verify callback');
    req.session.signedInUser = {google_id: google_id};
    db.each("SELECT * FROM users where google_id = '" + google_id + "'",
      // callback when query finished
      (err, row) => {
        if (err) {
          console.log('login err: no match found in user database');
          res.send({google_id: google_id});
        } else {
          // console.log('login acquired:', row);
          req.session.signedInUser = Object.assign(req.session.signedInUser, row);
          res.send(req.session.signedInUser);
        }
      }
    );
  });

});

/*
 * handle logout
 */
app.post('/logout', function(req, res) {
  console.log('/logout with POST method');
  req.session.destroy((err) => {
    if (err) {
      console.log('logout err:', err);
    }
  });
  res.send();
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
