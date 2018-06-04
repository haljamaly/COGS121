/*
  This file has all the code that handles the get and post requests made while using the website. It holds all the data that is responsible for
  sending data to all the pages in the front end.
 */

// Requireing all the dependencies for the website to function properly.
const express = require('express');
const flash = require('express-flash-2');
const nunjucks = require('nunjucks');
const sqlite3 = require('sqlite3');

// Instantiating a database object to use while running the website.
const db = new sqlite3.Database('app.db');

const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const app = express();

// allow post method handeling
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

// validate google id id token
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '687083663797-h6rk9pcjjm2ac1kib7kcbbjqpqc2ipcg.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
}


// all static files (html, js, css, img) goes into /src/
app.use(express.static('src'));

// random secret key
app.use(cookieParser('Y76(&@GB@#H@(&))'));

// Initializes a session so the user doesn't need to sign in again for a specified period of time
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
 * Homepage, doesn't require login
 */
app.get('/', (req, res) => {
  const posts = [];
  // Grabbing the posts to be displayed in the gallery
  db.serialize(() => {
    db.each("SELECT * FROM posts", (err, row) => {
      posts.push(row);
    }, () => {
      const signedInUser = req.session.signedInUser;
      const isSignedIn = !!signedInUser;
      let avatar = '';
      // Checking if a user is signed in to their account
      if (isSignedIn) {
        if (!signedInUser.img) {
          res.redirect('/signup');
          return;
        }
        avatar = signedInUser.img;
      } else {
        avatar = '/img/meme.jpg';
      }
      // Bundling up the data to be sent back to the homepage.
      const data = {posts: posts, title: 'Here-n-There', avatar: avatar, isSignedIn: isSignedIn || 0};
      res.render("index.html", data);
    });
  });
});

/*
 * Making new posts, require login
 */
app.get('/newpost', (req, res) => {
  // checks if the user is logged in or not and acts accordingly
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (isSignedIn) {
    if (!signedInUser.img) {
      res.redirect('/signup');
      return;
    }
    const avatar = signedInUser.img;
    data = {title: 'newposts', avatar: avatar, isSignedIn: isSignedIn || 0};
    res.render('newpost.html', data);
  } else {
    res.redirect('/login');
  }
});

/*
 * View user's profile, require login
 */
app.get('/profile', (req, res) => {
  // checks the user that has logged in
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (isSignedIn) {
    if (!signedInUser.img) {
      res.redirect('/signup');
      return;
    }
    const uid = signedInUser.uid;
    const avatar = signedInUser.img;
    const uname = signedInUser.name;
    const pinned = [];
    let posts = [];
    const pinnedposts = [];
    // Grabbing the posts pinned by the user
    db.serialize(() => {
      db.each("SELECT * FROM pins WHERE uid = '" + uid + "'", (err, row) => {
        pinned.push(row);
      }, () => {
        let pinnedids = [];
        for (x in pinned) {
          pinnedids.push(pinned[x].pid);
        }
          let pinnedstring = pinnedids.toString();
          let argument = "(" + pinnedstring + ")";
          db.each("SELECT * FROM posts WHERE pid in " + argument , (err, row) => {
            pinnedposts.push(row);
          }, () => {
            // Grabbing the posts that the user wrote
            db.each("SELECT * FROM posts WHERE author_uid = '" + uid + "'", (err, row) => {
              posts.push(row);
            }, () => {
              // done fetching, parse time and render
              posts = posts.map((obj) => {
                const date = new Date(obj.time);
                obj.time = date.toLocaleString();
                return obj;
              })
              const data = {title: 'Profile', avatar: avatar, uname: uname, posts: posts, pinned: pinnedposts, isSignedIn: true};
              res.render('profile.html', data);
            });
          });
      });
    });
  } else {
    res.redirect('/login');
  }
});

/*
 * Allows specific posts to be rendered on the home page when a location is looked up in the search bar.
*/
app.get('/locations/:location', (req, res) => {
  const posts = [];
  // Deconstructing the string to a location that can be looked up
  const locationToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':location' above
  // Grabbing all posts under a specific location name
  db.serialize(() => {
    db.each("SELECT * FROM posts WHERE location = '" + locationToLookup + "' COLLATE NOCASE", (err, row) => {
      posts.push(row);
    }, () => {
      // All done fetching records, send response;
      res.send(posts);
    });
  });
});

/*
 * Login prompt for un-signed-in users
 * If somehow the user accessed to this page, front end will check and redirect
 * to Homepage.
 */
app.get('/login', (req, res) => {
  res.render('login.html', {title: 'login', avatar: '/img/meme.jpg', isSignedIn:0});
});

/*
 * For user who signed in with google account but has no user info in our
 * database.
 */
app.get('/signup', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.redirect('/login');
    return;
  }
  const google_id = signedInUser.google_id;
  // check in database, if user has already signed up, go to Homepage
  // but this should not happen, unless user intentionally goes to this route
  // after they login
  db.get("SELECT * FROM users WHERE google_id = '" + google_id + "'",
    // callback when query finished
    (err, row) => {
      if (err) {
        console.log('login err: ' + err);
        res.send(err);
      } else if (row) {
        res.redirect('/');
      } else {
        res.render('signup.html', {title: 'Signup', avatar: '/img/meme.jpg', isSignedIn: true, google_id: google_id});
      }
    }
  );
});


/*
 * Creating the new account in the users table
 */
app.post('/signup', (req, res) => {
  const google_id = req.session.signedInUser.google_id;
  // Inserting into the users table
  db.run(
    'INSERT INTO users VALUES (NULL, $name, $img, $google_id)',
    // parameters to SQL query:
    {
      $name: req.body.name,
      $img: req.body.img,
      $google_id: google_id
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
        res.send({message: 'error in app.post(/signup)'});
      } else {
        // successfully signup user, now update session variable
        db.get("SELECT * FROM users WHERE google_id = '" + google_id + "'", (err, row) => {
          if (err) {
            console.log(err);
            res.send({message: 'error in database: ' + err});
          } else if (row) {
            req.session.signedInUser = Object.assign(req.session.signedInUser, row);
            res.send({message: 'successfully run app.post(/signup)'});
          } else {
            res.send({message: 'Error, somehow signup insertion to database failed.'});
          }
        });
      }
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
    req.session.signedInUser = {google_id: google_id};
    db.get("SELECT * FROM users WHERE google_id = '" + google_id + "'",
      // callback when query finished
      (err, row) => {
        if (err) {
        } else if (row) {
          req.session.signedInUser = Object.assign(req.session.signedInUser, row);
          res.send(req.session.signedInUser);
        } else {
          res.redirect('/signup');
        }
      }
    );
  });

});

/*
 * handle logout
 */
app.post('/logout', (req, res) => {
  console.log('/logout with POST method');
  req.session.destroy((err) => {
    if (err) {
      console.log('logout err:', err);
    }
  });
  res.send();
});


/*
* Handles rendering a specific post's data to display.
*/
app.get('/post/:postid', (req, res) => {
  console.log('get post/');
  // checks logged in user
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const signedInUid = (isSignedIn) ? signedInUser.uid : -1;
  let avatar = '';
  // Checking if a user is signed in to their account
  if (isSignedIn) {
    if (!signedInUser.img) {
      res.redirect('/signup');
      return;
    }
    avatar = signedInUser.img;
  } else {
    avatar = '/img/meme.jpg';
  }
  let post = {};
  let pinned = 0;
  const comments = [];
  const postid = req.params.postid; // matches ':postid' above
  // fetch post
  db.get("SELECT * FROM posts WHERE pid = '" + postid + "'", (err, row) => {
    post = row;

    // fetch pin info
    db.get("SELECT * FROM pins WHERE uid = $uid AND pid = $pid",
      // parameters to SQL query:
      {
        $uid: signedInUid,
        $pid: postid
      }, (err, row) => {
        if (row) {
          pinned = 1;
        }
        // fetch comments
        db.each("SELECT * FROM comments WHERE post = '" + postid + "'", (err, row) => {
          comments.push(row);
        }, () => {
          // All done fetching records, merge data and render response;
          const deleting = (signedInUid == post.author_uid) ? 1 : 0;

          const data = Object.assign({avatar: avatar, isSignedIn: isSignedIn || 0, comments: comments, me: deleting, pinned: pinned}, post);
          // parse time
          const date = new Date(data.time);
          data.time = date.toLocaleString();;
          res.render("post.html", data);
        });
    });
  });
});

/*
 * Handles the pinning of a post
 */
app.post('/post/:postid/pin', (req, res) => {
  // checks signed in user
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  // creates entry in database table
  db.run(
    'INSERT INTO pins VALUES ($uid, $pid)',
    // parameters to SQL query:
    {
      $uid: signedInUser.uid,
      $pid: pid
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send();
      }
    }
  );
});

/*
* Handles unpinning of post
*/
app.post('/post/:postid/unpin', (req, res) => {
  // checks if user is signed in
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  // removing pin from database table
  db.run(
    'DELETE FROM pins WHERE uid=$author_uid AND pid=$post',
    // parameters to SQL query:
    {
      $author_uid: signedInUser.uid,
      $post: pid,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
      } else {
        res.send();
      }
    }
  );
});

/*
* Handles deleting a post
*/
app.post('/post/:postid/delete', (req, res) => {
  // checks if user is signed in
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  // deletes post entry from table
  db.run(
    'DELETE FROM posts WHERE pid=$post',
    // parameters to SQL query:
    {
      $post: pid,
    },
    // callback function to run when the query finishes:
    () => {
      // deletes all pins of the deleted post
      db.run(
        'DELETE FROM pins WHERE pid=$post',
        // parameters to SQL query:
        {
          $post: pid,
        },
        // callback function to run when the query finishes:
        (err) => {
          if (err) {
            console.log(err);
          }
        }
      );
    }
  );
});

/*
* Handles the creation of a new comment to a post
*/
app.post('/post/:postid', (req, res) => {
  // Checks signed in user
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  // inserting comment into table
  db.run(
    'INSERT INTO comments VALUES (NULL, $author_UID,$author, $post, $content)',
    // parameters to SQL query:
    {
      $author_UID: signedInUser.uid,
      $author: signedInUser.name,
      $content: req.body.body,
      $post: req.params.postid,
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
});


/*
* handles creating a new post
*/
app.post('/newpost', (req, res) => {
  // checks for signed in user
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  // inserts new post into database
  db.run(
    'INSERT INTO posts VALUES (NULL, $title, $img, $time, $author_uid, $author_name, $location, $lat, $lng, $content)',
    // parameters to SQL query:
    {
      $title: req.body.name,
      $img: req.body.image,
      $time: req.body.time,
      $author_uid: signedInUser.uid,
      $author_name: signedInUser.name,
      $location: req.body.location,
      $lat: req.body.lat,
      $lng: req.body.lng,
      $content: req.body.body
    },
    // callback function to run when the query finishes:
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );
});

// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
