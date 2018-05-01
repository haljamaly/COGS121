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
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true})); // hook up with your app

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

const fakeDatabase = {
  users: {
    1: {
      uid: 1,
      name: 'Shuyuan',
      profile_img: 'img/shuyuan.jpg',
      posts: [1],
      visited: ['Mount Fuji'],
      wishilist: ['Los Angeles']},
    2: {
      uid: 2,
      name: 'Hasan',
      profile_img: 'img/hasan.jpg',
      posts: [2],
      visited: ['Los Angeles'],
      wishilist: ['New York']},
    3: {
      uid: 3,
      name: 'Dominic',
      profile_img: 'img/dom.jpg',
      posts: [],
      visited: ['Los Angeles'],
      wishilist: ['Mount Fuji']}
  },

  posts: {
    1: {
      title: 'Mount Fuji is good!',
      primary_img: 'https://news.cruise1st.co.uk/wp-content/uploads/2018/03/header-mount-fuji.jpg',
      time: '2018-4-22T10:25:43.511Z',
      author: 1,
      location: 'Fuji Mountain',
      content: '<p>Yo, Mount Fuji is awesome.</p>',
      id: 1
    },
    2: {
      title: 'LA is lit!',
      primary_img: 'https://amp.businessinsider.com/images/5aa2d4bb06b2b72a008b45c3-750-563.jpg',
      time: '2018-4-22T14:25:43.511Z',
      author: 2,
      location: 'Los Angeles',
      content: '<p>Los Angeles is beautiful and alive.</p>',
      id: 2
    }
  },

  locations: {
    'Mount Fuji': {
      posts: [1],
      visited_users: [1],
      wish_users: [3],
      coordinate: '35°21\'29\"N 138°43\'52\"E',
      score: 3
    },
    'Los Angeles': {
      posts: [2],
      visited_users: [2, 3],
      wish_users: [1],
      coordinate: '34°03\'N 118°15\'W',
      score: 4
    },
    'New York': {
      posts: [],
      visited_users: [],
      wish_users: [2],
      coordinate: '34°03\'N 118°15\'W',
      score: 1
    }
  }

};


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

//   db.serialize( () => {
//   db.each('SELECT * FROM posts', posts,  (err, rows) => {
//     posts.push(rows);
//   });
//   () => {
//   console.log(posts);
//   res.render('index.html', {title: 'home', posts: posts})
// };
// });
// });

app.get('/newpost', function(req, res) {
  res.render('newpost.html', { title: 'posts' });
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

// for testing flash message
app.get('/flash', function(req, res){
  // Set a flash message by passing the key, followed by the value, to res.flash().
  // for types, please refer https://getbootstrap.com/docs/4.0/components/alerts/
  res.flash('danger', 'Flash danger is back!');
  res.flash('info', 'Flash info is back!');
  res.redirect('/');
});

app.get('/locations/:location', (req, res) => {
  const nameToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':userid' above
  let val = '';
  Object.keys(fakeDatabase.locations).some((key) => {
    if (key.toLowerCase() == nameToLookup) {
      val = fakeDatabase.locations[key].posts;
      return true;
    }
  });
  console.log(nameToLookup, '->', val); // for debugging
  let data = [];
  if (val) {
    val.forEach((post) => {
      console.log(post);
      data.push(fakeDatabase.posts[post]);
    });
    console.log(data);
    res.send(data);
  } else {
    return;
    //res.send({}); // failed, so return an empty object instead of undefined
  }
});


/*
 * handle data access
 */
app.get('/users', (req, res) => {
  //const allUsernames = Object.keys(fakeDatabase); // returns a list of object keys
  const allUsernames = Object.keys(fakeDatabase.users).map((key) => {
    return fakeDatabase.users[key].name;
  });
  console.log('allUsernames is:', allUsernames);
  res.send(allUsernames);
});

app.get('/users/:username', (req, res) => {
  const nameToLookup = req.params.username.toLowerCase(); // matches ':userid' above
  let val = '';
  Object.keys(fakeDatabase.users).some((key) => {
    if (fakeDatabase.users[key].name.toLowerCase() == nameToLookup) {
      val = fakeDatabase.users[key];
      return true;
    }
  });
  console.log(nameToLookup, '->', val); // for debugging
  if (val) {
    res.send(val);
  } else {
    res.send({}); // failed, so return an empty object instead of undefined
  }
});

app.get('/post/:postid', (req, res) => {
  const postid = req.params.postid;
  const val = fakeDatabase.posts[postid];
  console.log(postid, '->', val); // for debugging
  if (val) {
    res.render('post.html', { title: val.title+' - '+fakeDatabase.users[val.author].name,
                              post_title: val.title,
                              primary_img: val.primary_img,
                              time: val.time,
                              location: val.location,
                              author: fakeDatabase.users[val.author].name,
                              content: val.content});
  } else {
    res.render('error.html'); // failed, so return an empty object instead of undefined
  }
});

// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
