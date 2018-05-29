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
 * Homepage, doesn't require login
 */
app.get('/', (req, res) => {
  const posts = [];
  db.serialize(() => {
    db.each("SELECT * FROM posts", (err, row) => {
      posts.push(row);
    }, () => {
      // All done fetching records, render response
      // console.log(posts);
      const signedInUser = req.session.signedInUser;
      const isSignedIn = !!signedInUser;
      let avatar = '';
      if (isSignedIn) {
        if (!signedInUser.img) {
          res.redirect('/signup');
          return;
        }
        avatar = signedInUser.img;
      } else {
        avatar = '/img/meme.jpg';
      }
      const data = {posts: posts, title: 'Here-n-There', avatar: avatar, isSignedIn: isSignedIn || 0};
      res.render("index.html", data);
    });
  });
});

/*
 * Making new posts, require login
 */
app.get('/newpost', (req, res) => {
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
 * Browse locations, doesn't require login
 */
app.get('/locations', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  let avatar = '';
  if (isSignedIn) {
    if (!signedInUser.img) {
      res.redirect('/signup');
      return;
    }
    avatar = signedInUser.img;
  } else {
    avatar = '/img/meme.jpg';
  }
  const data = {title: 'Locations', avatar: avatar, isSignedIn: isSignedIn || 0};
  res.render("locations.html", data);
});

/*
 * View user's profile, require login
 */
app.get('/profile', (req, res) => {
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
    db.serialize(() => {
      db.each("SELECT * FROM pins WHERE uid = '" + uid + "'", (err, row) => {
        pinned.push(row);
      }, () => {
        let whatever = [];
        for (x in pinned) {
          whatever.push(pinned[x].pid);
        }
          let whatever2 = whatever.toString();
          let argument = "(" + whatever2 + ")";
          db.each("SELECT * FROM posts WHERE pid in " + argument , (err, row) => {
            pinnedposts.push(row);
          }, () => {
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
              console.log(data);
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
 * About page, doesn't require login
 */
app.get('/about', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  let avatar = '';
  if (isSignedIn) {
    if (!signedInUser.img) {
      res.redirect('/signup');
      return;
    }
    avatar = signedInUser.img;
  } else {
    avatar = '/img/meme.jpg';
  }
  const data = {title: 'About', avatar: avatar, isSignedIn: isSignedIn || 0};
  res.render("about.html", data);
});


app.get('/locations/:location', (req, res) => {
  const posts = [];
  const locationToLookup = req.params.location.toLowerCase().split('_').join(' '); // matches ':location' above
  db.serialize(() => {
    db.each("SELECT * FROM posts WHERE location = '" + locationToLookup + "' COLLATE NOCASE", (err, row) => {
      posts.push(row);
    }, () => {
      // All done fetching records, send response;
      res.send(posts);
      //  res.render("index.html", {posts: posts, title: 'home'});
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


app.post('/signup', (req, res) => {
  const google_id = req.session.signedInUser.google_id;
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
          } else if (row) {
            req.session.signedInUser = Object.assign(req.session.signedInUser, row);
            res.send({message: 'successfully run app.post(/signup)'});
          } else {
            console.log('Error, somehow signup insertion to database failed.');
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
    console.log('verify callback, google_id: ' + google_id);
    req.session.signedInUser = {google_id: google_id};
    db.get("SELECT * FROM users WHERE google_id = '" + google_id + "'",
      // callback when query finished
      (err, row) => {
        if (err) {
          console.log('login err: ' + err);
        } else if (row) {
          // console.log('login acquired:', row);
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
 * handle data access
 */
app.get('/users', (req, res) => {
  let names = [];
  db.serialize(() => {
      db.each("SELECT name FROM users", (err, row) => {
          names.push(row);
      }, () => {
          // All done fetching records, render response;
          res.send(names);
        //  res.render("index.html", {posts: posts, title: 'home'});
      });
    });
});

app.get('/users/:username', (req, res) => {
  let posts = [];
  const nameToLookup = req.params.username.toLowerCase().split('_').join(' '); // matches ':userid' above
  db.serialize(() => {
    const nameToLookup = req.params.username.toLowerCase().split('_').join(' '); // matches ':userid' above
      db.each("SELECT * FROM users WHERE name = '" + nameToLookup + "' COLLATE NOCASE", (err, row) => {
          posts.push(row);
      }, () => {
          // All done fetching records, render response;
          res.send(posts);
        //  res.render("index.html", {posts: posts, title: 'home'});
      });
    });
});


app.get('/post/:postid', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  const signedInUid = (isSignedIn) ? signedInUser.uid : -1;
  const avatar = isSignedIn ? signedInUser.img : '/img/meme.jpg';
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
          data.time = date.toLocaleString();
          console.log('\npost/'+postid+' data:');
          console.log(data);
          res.render("post.html", data);
        });
    });
  });
});


app.post('/post/:postid/pin', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  console.log('\nPOST/post/'+pid+'/pin');
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
        res.send({message: 'error in app.post(/:postid/pin)'});
      } else {
        res.send({message: 'successfully run app.post(/:postid/pin)'});
      }
    }
  );
});

app.post('/post/:postid/unpin', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  console.log('\nPOST/post/'+pid+'/unpin');
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
        res.send({message: 'error in app.post(/:postid/unpin)'});
      } else {
        res.send({message: 'successfully run app.post(/:postid/unpin)'});
      }
    }
  );
});

app.post('/post/:postid/delete', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  const pid = req.params.postid;
  console.log(pid);
  console.log(req.body);
  db.run(
    'DELETE FROM posts WHERE pid=$post',
    // parameters to SQL query:
    {
      $post: pid,
    },
    // callback function to run when the query finishes:
    () => {
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
            res.send({message: 'error in app.post(/post/:postid/delete)'});
          } else {
            res.send({message: 'successfully run app.post(/post/:postid/delete)'});
          }
        }
      );
    }
  );
});



app.post('/post/:postid', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  console.log("body is : " + req.body);

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
        res.send({message: 'error in comment app.post(/post/:postid)'});
      } else {
        res.send({message: 'successfully run comment app.post(/post/:postid)'});
      }
    }
  );
});


app.post('/newpost', (req, res) => {
  const signedInUser = req.session.signedInUser;
  const isSignedIn = !!signedInUser;
  if (!isSignedIn) {
    res.send({message: 'not signedin'});
    return;
  }
  // guarantee user is signedin
  console.log(req.body);

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
        res.send({message: 'error in app.post(/newpost)'});
      } else {
        res.send({message: 'successfully run app.post(/newpost)'});
      }
    }
  );
});


// for testing flash message
app.get('/flash', (req, res) => {
  // Set a flash message by passing the key, followed by the value, to res.flash().
  // for types, please refer https://getbootstrap.com/docs/4.0/components/alerts/
  res.flash('danger', 'Flash danger is back!');
  res.flash('info', 'Flash info is back!');
  res.redirect('/');
});


// start the server at URL: http://localhost:3000/
app.listen(3000, () => {
  console.log('Server started at http://localhost:3000/');
});
