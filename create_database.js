// Node.js + Express server backend for petsapp
// v2 - use SQLite (https://www.sqlite.org/index.html) as a database
//
// COGS121 by Philip Guo
// https://github.com/pgbovine/COGS121

// run this once to create the initial database as the pets.db file
//   node create_database.js

// to clear the database, simply delete the pets.db file:
//   rm pets.db

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('app.db');


// run each database statement *serially* one after another
// (if you don't do this, then all statements will run in parallel,
//  which we don't want)
db.serialize(() => {
  // create a new database table:
  db.run("CREATE TABLE users (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, img TEXT, google_id TEXT UNIQUE)");
  db.run("CREATE TABLE wishlist (uid INTEGER NOT NULL, location TEXT NOT NULL)");
  db.run("CREATE TABLE visited (uid INTEGER NOT NULL, location TEXT NOT NULL)");
  db.run("CREATE TABLE posts (pid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, img TEXT NOT NULL, time TEXT, author_uid INTEGER NOT NULL, location TEXT NOT NULL COLLATE NOCASE, content TEXT NOT NULL)");
  db.run("CREATE TABLE locations (title TEXT PRIMARY KEY, score INTEGER NOT NULL)");
  db.run("CREATE TABLE comments (cid INTEGER PRIMARY KEY AUTOINCREMENT, author_id INTEGER NOT NULL, author TEXT NOT NULL, post INTEGER NOT NULL, body TEXT NOT NULL)");
  db.run("CREATE TABLE pins (uid INTEGER NOT NULL, pid INTEGER NOT NULL, unique(uid,pid))");

  // insert 3 rows of data:
  db.run("INSERT INTO users VALUES (1, 'Hasan', '/img/hasan.jpg', '12345')");
  db.run("INSERT INTO users VALUES (2, 'Shuyuan', '/img/shuyuan.jpg', '115171345662424295181')");
  db.run("INSERT INTO users VALUES (3, 'Dom', '/img/dom.jpg', '45678')");

  db.run("INSERT INTO wishlist VALUES (1, 'Los Angeles')");
  db.run("INSERT INTO wishlist VALUES (2, 'New York')");
  db.run("INSERT INTO wishlist VALUES (3, 'New York')");

  db.run("INSERT INTO visited VALUES (1, 'Mount Fuji')");
  db.run("INSERT INTO visited VALUES (2, 'Los Angeles')");
  db.run("INSERT INTO visited VALUES (3, 'Mount Fuji')");
  db.run("INSERT INTO visited VALUES (2, 'Mount Fuji')");

  db.run("INSERT INTO posts VALUES (1,'Mount Fuji is good!', 'https://news.cruise1st.co.uk/wp-content/uploads/2018/03/header-mount-fuji.jpg', '2018-04-22T10:25:43.511', 1, 'Mount Fuji', '<p>Yo, Mount Fuji is awesome.</p>')");
  db.run("INSERT INTO posts VALUES (2,'Los Angeles is lit!', 'https://amp.businessinsider.com/images/5aa2d4bb06b2b72a008b45c3-750-563.jpg','2018-04-22T14:25:43.511Z',2, 'Los Angeles', '<p>Los Angeles is beautiful and alive.</p>')");

  db.run("INSERT INTO locations VALUES ('Mount Fuji', 3)");
  db.run ("INSERT INTO locations VALUES ('Los Angeles', 2)");
  db.run("INSERT INTO locations VALUES ('New York', 2)");
  console.log('successfully created the tables');

  // print them out to confirm their contents:
  //db.each("SELECT name, job, pet FROM users_to_pets", (err, row) => {
  //    console.log(row.name + ": " + row.job + ' - ' + row.pet);
  });

db.close();
