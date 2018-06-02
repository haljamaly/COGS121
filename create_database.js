// The code on this file is responsible for constructing the database file 'app.db' which will contain the data for the application. The database engine being
// used is SQLITE. The first step is to create the database file, followed by creating the database tables and inserting data into the tables.

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('app.db');


// run each database statement *serially* one after another
db.serialize(() => {
  // create a new database table:
  db.run("CREATE TABLE users (uid INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, img TEXT, google_id TEXT UNIQUE)");
  db.run("CREATE TABLE posts (pid INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, img TEXT NOT NULL, time TEXT, author_uid INTEGER NOT NULL, author_name TEXT NOT NULL, location TEXT NOT NULL COLLATE NOCASE, lat INTEGER NOT NULL, lng INTEGER NOT NULL, content TEXT NOT NULL)");
  db.run("CREATE TABLE comments (cid INTEGER PRIMARY KEY AUTOINCREMENT, author_uid INTEGER NOT NULL, author_name TEXT NOT NULL, post INTEGER NOT NULL, body TEXT NOT NULL)");
  db.run("CREATE TABLE pins (uid INTEGER NOT NULL, pid INTEGER NOT NULL, unique(uid,pid))");

  // Create three users and insert them in the database table:
  db.run("INSERT INTO users VALUES (1, 'Hasan', '/img/hasan.jpg', '12345')");
  db.run("INSERT INTO users VALUES (2, 'Shuyuan', '/img/shuyuan.jpg', '115171345662424295181')");
  db.run("INSERT INTO users VALUES (3, 'Dom', '/img/dom.jpg', '45678')");

  // Creating 2 posts in the database.
  db.run("INSERT INTO posts VALUES (1,'Mount Fuji is good!', 'https://news.cruise1st.co.uk/wp-content/uploads/2018/03/header-mount-fuji.jpg', '2018-04-22T10:25:43.511', 1, 'Hasan', 'Mount Fuji, Kitayama, Fujinomiya, Shizuoka Prefecture, Japan', '35.3605555', '138.72777769999993', '<p>Yo, Mount Fuji is awesome.</p>')");
  db.run("INSERT INTO posts VALUES (2,'Los Angeles is lit!', 'https://amp.businessinsider.com/images/5aa2d4bb06b2b72a008b45c3-750-563.jpg','2018-04-22T14:25:43.511Z',2, 'Shuyuan', 'Los Angeles, CA, USA', '34.0522342', '-118.2436849', '<p>Los Angeles is beautiful and alive.</p>')");
});

db.close();
