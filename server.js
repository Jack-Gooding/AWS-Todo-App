// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    //var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var fs = require('fs');
    var sqlite3 = require('sqlite3').verbose();

    // configuration =================
    //mongoose.connect('mongodb://127.0.0.1/node-test');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());


    // define model =================
/*    var Todo = mongoose.model('Todo', {
        text : String
    });
*/


let db = new sqlite3.Database('./public/database/toDo.db', (err) => {

  if (err) {
    return console.error("Could not connect to DB: "+err.message);
  }

  console.log('Connected to the toDo SQlite database.');
});

db.serialize(() => {
db.run(`CREATE TABLE if not exists toDoList (
  toDoid integer PRIMARY KEY,
  text TEXT NOT NULL)`,
  function(err) {
    if (err) { return console.log("Incorrect Creation: "+err) };
  });
});

//SELECT name FROM sqlite_master WHERE type = "table"

// routes ======================================================================
let postGET = function() {
  db.all(`SELECT toDoid, text FROM toDoList ORDER BY toDoid`, [], (err, rows) => {
    if (err){
      res.send(err);
      throw err;
    }
    console.log(rows);
    res.json(rows);
  });
}
    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function(req, res) {

        // use mongoose to get all todos in the database
/*        Todo.find(function(err, todos) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(todos); // return all todos in JSON format
        });

db.each(`SELECT text FROM toDoList ORDER BY toDoid DESC`, function(err, row, postGET) {
  if (err){
    res.send(err);
    throw err;
  }
  //row = [row];
  toDo.push(row);
  console.log(row);
  console.log(toDo);
});
*/
db.all(`SELECT toDoid, text FROM toDoList ORDER BY toDoid`, [], (err, rows) => {
  if (err){
    res.send(err);
    throw err;
  }
  console.log(rows);
  res.json(rows);
});


});
    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

            let newToDo = req.body.text;
            db.run(`INSERT INTO toDoList(text) VALUES('${newToDo}')`, function(err, data) {
              if (err) { return console.log("Could not add db entry: " + err.message)};
              console.log(`A row has been inserted into toDoList with rowid ${this.lastID} and value ${newToDo}.`);
              console.log(data);
              db.all(`SELECT toDoid, text FROM toDoList ORDER BY toDoid`, [], (err, rows) => {
                if (err){
                  res.send(err);
                  throw err;
                }
                console.log(rows);
                res.json(rows);
              });
            });
        });



    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {

        db.run(`DELETE FROM toDoList WHERE toDoid = ${req.params.todo_id}`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`A row has been removed from toDoList with rowid ${this.lastID}.`);
          db.all(`SELECT toDoid, text FROM toDoList ORDER BY toDoid`, [], (err, rows) => {
              if (err){
                res.send(err);
                throw err;
              }
              console.log(rows);
              res.json(rows);
            });
        });

    });

    app.delete('/api/todos/all', function(req, res) {

        db.run(`DELETE FROM toDoList WHERE *`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`A row has been removed from toDoList with rowid ${this.lastID}.`);
        });

    });


    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");
