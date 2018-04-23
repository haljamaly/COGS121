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
      primary_img: 'img/1.jpg',
      time: '2018-4-22T10:25:43.511Z',
      author: 1,
      location: 'Fuji Mountain',
      content: '<p>Yo, Mount Fuji is awesome.</p>'
    },
    2: {
      title: 'LA is lit!',
      primary_img: 'img/1.jpg',
      time: '2018-4-22T14:25:43.511Z',
      author: 2,
      location: 'Los Angeles',
      content: '<p>Los Angeles is beautiful and alive.</p>'
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
