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
  db.run("CREATE TABLE posts (pid text PRIMARY KEY, title text NOT NULL, img text, time text, author text NOT NULL, location text NOT NULL, content text NOT NULL)");
  db.run("CREATE TABLE locations (coordinate text PRIMARY KEY, title text NOT NULL, score integer NOT NULL)");

  // insert 3 rows of data:
  //db.run("INSERT INTO users_to_pets VALUES ('Philip', 'professor', 'cat.jpg')");


  console.log('successfully created the users_to_pets table in pets.db');

  // print them out to confirm their contents:
  //db.each("SELECT name, job, pet FROM users_to_pets", (err, row) => {
  //    console.log(row.name + ": " + row.job + ' - ' + row.pet);
  });

db.close();
