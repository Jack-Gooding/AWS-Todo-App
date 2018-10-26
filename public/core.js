let selectTable = function(tableName = "General") {
  setTimeout(function() {
    $("#Table_"+tableName).tab("show");
  },5);
};

// Simple event watcher to allow key shortcuts
ctrlIsPressed = false;
shiftIsPressed = false;
altIsPressed = false;
$(document).on({

    keydown: function(event){ // Watches for keydowns, changes behaviour accordingly
      if (event.which=="16") { shiftIsPressed = true;};
      if (event.which=="17") { ctrlIsPressed = true; };
      if (event.which=="18") { altIsPressed = true;  };
    },
    keyup:  function(event){ // Watches for keyups, changes behaviour accordingly
      if (event.which=="16") { shiftIsPressed = false;};
      if (event.which=="17") { ctrlIsPressed = false; };
      if (event.which=="18") { altIsPressed = false;  };
    },
});

$(window).blur(function(){ // Resets button presses if page loses focus
  ctrlIsPressed = false;
  shiftIsPressed = false;
  altIsPressed = false;
});

//Takes two dates formatted as ISO 8601 YY-MM-DD and returns the number of days between the two
function differenceInDays(date1, date2) {

// First we split the values to arrays date1[0] is the year, [1] the month and [2] the day
date1 = date1.split('-');
date2 = date2.split('-');

// Now we convert the array to a Date object, which has several helpful methods
date1 = new Date(date1[0], date1[1], date1[2]);
date2 = new Date(date2[0], date2[1], date2[2]);

// We use the getTime() method and get the unixtime (in milliseconds, but we want seconds, therefore we divide it through 1000)
date1_unixtime = parseInt(date1.getTime() / 1000);
date2_unixtime = parseInt(date2.getTime() / 1000);

// This is the calculated difference in seconds ) minutes ) hours ) days
var timeDifference = (((date2_unixtime - date1_unixtime ) /60) /60) /24;
return timeDifference;
};

var toDoApp = angular.module('toDoApp', []);

//This directive allows communication between JQueryUI module 'datepicker' and the angular scope.
toDoApp.directive('datepicker', function ($parse) {
    return function (scope, element, attrs, controller) {
        var ngModel = $parse(attrs.ngModel);
        $(function(){
            element.datepicker({
                numberOfMonths: 3,
                changeYear:true, //year dropdown
                changeMonth:true, //month dropdown
                dateFormat:'yy-mm-dd', //ISO 8601
                minDate: new Date(), //prevents user selection of dates before <current.date>
                yearRange: '2018:2030',
                showWeek: true, //shows week# on popup
                showButtonPanel: true,
                onSelect:function (dateText, inst) {
                    scope.$apply(function(scope){
                        // Change binded variable
                        ngModel.assign(scope, dateText);
                    });
                }
            });
        });
    }
});

function mainController($scope, $http) {
    // Main data
    $scope.tables = [{name: "General", toDo: [],},];
    // Current data from <input>
    $scope.formData = {};
    $scope.newTableData = 0;

    $scope.calcDays = function() {
      $scope.tables.forEach(function(tables, i) {
        $scope.tables[i].toDo.forEach(function(task, j) {
          if($scope.tables[i].toDo[j].date_due != "--") {
            $scope.tables[i].toDo[j].days_left = differenceInDays($scope.tables[i].toDo[j].date_added, $scope.tables[i].toDo[j].date_due);
          } else {
            $scope.tables[i].toDo[j].days_left = "--";
          }
        });
        //console.log($scope.tables[index].name);
      });
    };
    // Changes which table is being targeted   -- Attached to each table header, passed the index from ng-repeat
    $scope.selectTable = function(index) {
      $scope.tableToDisplay = index;
      console.log(index)
    };

//
//Initial page load
//
//GET all todos, process and push to DOM
$http.get('/api/todos/')
  .success(function(data) {
        $scope.tables = data;
        console.log(data);
        //$('#Table_General').tab('show');
        //$('#tableList li:first').tab('show');
        $scope.tableToDisplay = 0;
        selectTable();
        //This is a repeat of code inside selectTable, won't run on load without this
        $scope.calcDays();
  })
  .error(function(data) {
        console.log('GET error: ' + data);
});

//
// Make new todo
//
//takes data from formData, text & date_due
$scope.createTodo = function() {
  if (typeof($scope.formData.text) != "undefined") {
  $http.post('/api/todos/'+$scope.tableToDisplay, $scope.formData)
      .success(function(data) {
        console.log(data);
          $scope.formData = {}; // clear the form so our user is ready to enter another
          $scope.tables = data;
          selectTable($scope.tables[$scope.tableToDisplay].name);
          $scope.calcDays();
    })
    .error(function(data) {
          console.log('POST error: ' + data);
    });
  } else {
    $(".formdata-text").css("box-shadow", "0 0 5px 2px yellow");
    setTimeout(function() {
      $(".formdata-text").css("box-shadow", "0 0 0 0 black");
    },500)
  };
};

//
// Make new table
//
//Asks user for Table name, sends POST request to server to make new table
$scope.createTable = function() {
  let newTable = prompt('Enter table name');
  newTable = newTable.split(" ").join("_"); //SQL does not accept spaces. Replaces all spaces with underscores.
  $http.post('/api/create/'+ newTable)
      .success(function(data) {
        console.log('Table: '+data);
          $scope.newTableData = {};
          $scope.tables = data;
          selectTable($scope.tables[$scope.tableToDisplay].name);
          $scope.calcDays();

      })
      .error(function(data) {
          console.log('POST error: ' + data);
      });
};

// delete a todo after checking it
$scope.deleteTodo = function(id) {
  if (ctrlIsPressed || confirm('Delete this task? (hold CTRL to auto-confirm)')) {
    $http.delete(`/api/todos/${$scope.tableToDisplay}/${id}`)
      .success(function(data) {
          console.log(`deleted: ${id} from ${$scope.tables[$scope.tableToDisplay].name}`);
            $scope.tables = data;
            selectTable($scope.tables[$scope.tableToDisplay].name);
            $scope.calcDays();
      })
      .error(function(data) {
            console.log('DELETE error: ' + data);
      });
  };
};

//Send DELETE request, uses current selected table
$scope.deleteTable = function() {
    if (confirm(`Do you want to delete table:  ${$scope.tables[$scope.tableToDisplay].name}?`)) {
    $http.delete('/api/tables/'+ $scope.tables[$scope.tableToDisplay].name)
        .success(function(data) {
          console.log('delete: '+data);
            $scope.tables = data;
            selectTable($scope.tables[$scope.tableToDisplay].name);
            $scope.calcDays();
        })
        .error(function(data) {
            console.log('DELETE error: ' + data);
        });
  };
};

}; //Controller end
