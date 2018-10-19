// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var fs = require('fs');
    var sqlite3 = require('sqlite3').verbose();

    // configuration =================

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());



let db_all;
let db = new sqlite3.Database('./public/database/toDo.db', (err) => {

  if (err) {
    return console.error("Could not connect to DB: "+err.message);
  }

  console.log('Connected to the toDo SQlite database.');
});

db.serialize(() => {
db.run(`CREATE TABLE if not exists General (
  toDoid integer PRIMARY KEY,
  text TEXT NOT NULL,
  date_text TEXT NOT NULL
  )`,
  function(err) {
    if (err) { return console.log("Incorrect Creation: "+err) };
  });
});


let getTableData = function(options, callBack) {
  let db_all = [];
  //SELECT name FROM sqlite_master WHERE type = "table"
  db.each("SELECT name FROM sqlite_master WHERE type='table'", function (err, table) {
    if (err) {
      console.log(err);
    }
    db_all.push(table);
  // Execute the callback function and pass the parameters to it
}, function(err, count) {
  console.log("count: "+count);
  let dbTableList = [];
  db_all.forEach(function(table, index, array) {
    db_all[index].toDo = [];
    dbTableList.push(table.name);
      db.all(`SELECT toDoid, text, date_text FROM ${table.name} ORDER BY toDoid`, [], (err, rows) => {
        if (err){
          throw err;
        }
          console.log(rows[row]);
        counter++;

        db_all[index].toDo = rows;

        if(counter === array.length) {
          console.log(db_all);
        };
        //console.log(index);
        //console.log(rows);

        //for (let row = 0; row < rows.length; row++) {
        //}

        //};

      });
  });
  console.log("Existing Table List:- "+dbTableList.join(", "));
});
};

getTableData();

// routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all todos

app.post('/api/create', function(req, res) {
  console.log(req.body.tableName)
  let newTable = req.body.tableName;
  db.run(`CREATE TABLE if not exists ${newTable} (
    toDoid integer PRIMARY KEY,
    text TEXT NOT NULL,
    date_text TEXT NOT NULL
    )`,
    function(err) {
      if (err) { return console.log("Incorrect Creation: "+err) };
      console.log(`Created table with name ${newTable}`);
      res.send(`${newTable}`);
    });
});

let counter = 0;

app.get('/api/todos', function(req, res) {
  let db_all = [];
  counter = 0;
  //SELECT name FROM sqlite_master WHERE type = "table"
  db.each("SELECT name FROM sqlite_master WHERE type='table'", function (err, table) {
    if (err) {
      console.log(err);
    }
    db_all.push(table);
  // Execute the callback function and pass the parameters to it
}, function(err, count) {
  console.log("count: "+count);
  let dbTableList = [];
  db_all.forEach(function(table, index, array) {
    db_all[index].toDo = [];
    dbTableList.push(table.name);
      db.all(`SELECT toDoid, text, date_text FROM ${table.name} ORDER BY toDoid`, [], (err, rows) => {
        if (err){
          throw err;
        }
        counter++;

        db_all[index].toDo = rows;

        if(counter === array.length) {
          console.log(db_all);
          res.send(db_all);
        };
        //console.log(index);
        //console.log(rows);

        //for (let row = 0; row < rows.length; row++) {
        //}

        //};

      });
  });
  console.log("Existing Table List:- "+dbTableList.join(", "));
});
});
    // create todo and send back all todos after creation
    app.post('/api/todos/:table_id', function(req, res) {
      let table_id;
            if (req.params.table_id != 'undefined') {
              table_id = db_all[req.params.table_id].name;
            } else {
              table_id = "General";
              console.log("not defined");
            }

            let newToDo = req.body.text;

            db.run(`INSERT INTO ${table_id}(text, date_text) VALUES('${newToDo}', date('now', 'localtime'))`, function(err) {
              if (err) { return console.log("Could not add db entry: " + err.message)};
              console.log(`A row has been inserted into ${table_id} with rowid ${this.lastID} and values ${newToDo}.`);
              db.all(`SELECT toDoid, text, date_text FROM ${table_id} ORDER BY toDoid`, [], (err, rows) => {
                if (err){
                  res.send(err);
                  throw err;
                }
                res.json(rows);
              });
            });
        });



    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {

        db.run(`DELETE FROM General WHERE toDoid = ${req.params.todo_id}`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`A row has been removed from General with rowid ${this.lastID}.`);
          db.all(`SELECT toDoid, text, date_text FROM General ORDER BY toDoid`, [], (err, rows) => {
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

        db.run(`DELETE FROM General WHERE *`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`A row has been removed from General with rowid ${this.lastID}.`);
        });

    });


    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    // listen (start app with node server.js) ======================================
    app.listen(80);
    console.log("App listening on port 8080");
