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



let db_all = [];
let counter = 0;
let db = new sqlite3.Database('./public/database/toDo.db', (err) => {

  if (err) {
    return console.error("Could not connect to DB: "+err.message);
  }

  console.log('Connected to the toDo SQlite database.');
});

let getTableData = function(sendRequest, req, res) {
  db_all = [];
  counter = 0;
  //SELECT name FROM sqlite_master WHERE type = "table"
  db.each("SELECT name FROM sqlite_master WHERE type='table'", function (err, table) {
    if (err) {
      console.log(err);
    }
    db_all.push(table);
  // Execute the callback function and pass the parameters to it
}, function(err, count) {
  let dbTableList = [];
  db_all.forEach(function(table, index, array) {
    db_all[index].toDo = [];
    dbTableList.push(table.name);
      db.all(`SELECT toDoid, text, date_added, date_due FROM ${table.name} ORDER BY toDoid`, [], (err, rows) => {
        if (err){
          throw err;
        }
        counter++;

        db_all[index].toDo = rows;
        if(counter === array.length && sendRequest) {
          res.json(db_all);
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
}

db.serialize(() => {
db.run(`CREATE TABLE if not exists General (
  toDoid integer PRIMARY KEY,
  text TEXT NOT NULL,
  date_added TEXT NOT NULL,
  date_due TEXT
  )`,
  function(err) {
    if (err) { return console.log("Incorrect Creation: "+err) };
  });
});

//Get data from toDo.db
//'false' flag stops res.send failure
getTableData(false);

// routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all todos

//Creates table
app.post('/api/create/:table_name', function(req, res) {
  if (req.params.table_name != "undefined") {

    db.run(`CREATE TABLE if not exists ${req.params.table_name} (
      toDoid integer PRIMARY KEY,
      text TEXT NOT NULL,
      date_added TEXT NOT NULL,
      date_due TEXT
      )`,
      function(err) {
        if (err) {
          res.send(err);
          return console.log("Incorrect Creation: "+err)
         };
        console.log(`Created table with name ${req.params.table_name}`);
        getTableData(true, req, res);
      });
  } else {
    let errorMsg = "Error: Could not create 'undefined' table.";
    console.log(errorMsg);
    res.send(errorMsg);
  }
});

//Request db Data, usually on page load
app.get('/api/todos', function(req, res) {
getTableData(true, req, res);
});


    // create todo and send back all todos after creation
    app.post('/api/todos/:table_id', function(req, res) {
      let table_id;
      console.log(db_all);
            if (req.params.table_id != 'undefined') {
              table_id = db_all[req.params.table_id].name;
            } else {
              table_id = "General";
              console.log("not defined");
            }

            let newToDo = req.body.text;
            let newDueDate = "--";
            if (typeof(req.body.date_due) == "undefined") {
              newDueDate = "--";
            } else {
              newDueDate = req.body.date_due;
            };
            console.log(req.body.date_due);

            db.run(`INSERT INTO ${table_id}(text, date_added, date_due) VALUES('${newToDo}', date('now', 'localtime'), '${newDueDate}')`, function(err) {
              if (err) { return console.log("Could not add db entry: " + err.message)};
              console.log(`A row has been inserted into ${table_id} with rowid ${this.lastID} and values ${newToDo}.`);
              getTableData(true, req, res);
            });
        });



    // delete a todo
    app.delete('/api/todos/:table_id/:todo_id', function(req, res) {
        console.log(req.params.table_id);
        db.run(`DELETE FROM ${db_all[req.params.table_id].name} WHERE toDoid = ${req.params.todo_id}`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`A row has been removed from ${db_all[req.params.table_id].name} with rowid ${req.params.todo_id}.`);
          getTableData(true, req, res);
        });

    });

    //delete a table
    app.delete('/api/tables/:table_id', function(req, res) {
      if (req.params.table_id != 0) {
          db.run(`DROP TABLE IF EXISTS ${db_all[req.params.table_id].name};`, function(err) {
          if (err) { return console.log("Could not remove db entry: " + err.message)};
          console.log(`Deleted Table: ${req.params.table_id}}.`);
          getTableData(true, req, res);
        });
      } else {
        console.log("Error: Cannot delete General!");
      }
    });


    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });


    // listen (start app with node server.js) ======================================
    app.listen(80);
    console.log("App listening on port 80");
