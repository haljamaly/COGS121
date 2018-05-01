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
  db.run("CREATE TABLE users (uid text PRIMARY KEY, name text NOT NULL, img text)");
  db.run("CREATE TABLE wishlist (user text NOT NULL, location text NOT NULL)");
  db.run("CREATE TABLE posts (pid INTEGER PRIMARY KEY AUTOINCREMENT, title text NOT NULL, img text, time text, author text NOT NULL, location text NOT NULL COLLATE NOCASE, content text NOT NULL)");
  db.run("CREATE TABLE locations (title text PRIMARY KEY, score integer NOT NULL)");

  // insert 3 rows of data:
  db.run("INSERT INTO users VALUES ('1', 'Hasan', 'src/img/hasan.jpg')");
  db.run("INSERT INTO users VALUES ('2', 'Shuyuan', 'src/img/shuyuan.jpg')");
  db.run("INSERT INTO users VALUES ('3', 'Dom', 'src/img/dom.jpg')");

  db.run("INSERT INTO wishlist VALUES ('1', 'Los Angeles')");
  db.run("INSERT INTO wishlist VALUES ('3', 'New York')");

  db.run("INSERT INTO posts VALUES ('1','Mount Fuji is good!', 'https://news.cruise1st.co.uk/wp-content/uploads/2018/03/header-mount-fuji.jpg', '2018-4-22T10:25:43.511', '1', 'Mount Fuji', '<p>Yo, Mount Fuji is awesome.</p>')");
  db.run("INSERT INTO posts VALUES ('2','Los Angeles is lit!', 'https://amp.businessinsider.com/images/5aa2d4bb06b2b72a008b45c3-750-563.jpg','2018-4-22T14:25:43.511Z','3', 'Los Angeles', '<p>Los Angeles is beautiful and alive.</p>')");

  db.run("INSERT INTO locations VALUES ('Mount Fuji', 1 )");
  db.run ("INSERT INTO locations VALUES ( 'Los Angeles', 1)");
  db.run("INSERT INTO locations VALUES ('New York', 0)");
  console.log('successfully created the tables');

  // print them out to confirm their contents:
  //db.each("SELECT name, job, pet FROM users_to_pets", (err, row) => {
  //    console.log(row.name + ": " + row.job + ' - ' + row.pet);
  });

db.close();
