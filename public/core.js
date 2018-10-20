// public/core.js

$(document).click(function() {
});

let selectTable = function(tableName = "General") {
  setTimeout(function() {
    $("#Table_"+tableName).tab("show");
  },5);
};

var toDoApp = angular.module('toDoApp', []);


function mainController($scope, $http) {
    // Main data
    $scope.tables = [{name: "General", toDo: [],},];
    // Current data from <input>
    $scope.formData = {};
    $scope.newTableData = 0;

    // Changes which table is being targeted   -- Attached to each table header, passed the index from ng-repeat
    $scope.selectTable = function(index) {
      $scope.tableToDisplay = index;
      console.log(index)
    };

    // when landing on the page, get all todos and show them
    $http.get('/api/todos/')
        .success(function(data) {
            $scope.tables = data;
            console.log(data);
            //$('#Table_General').tab('show');
            //$('#tableList li:first').tab('show');
            $scope.tableToDisplay = 0;
            selectTable();
        })
        .error(function(data) {
            console.log('GET error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos/'+$scope.tableToDisplay, $scope.formData)
            .success(function(data) {
              console.log(data);
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.tables = data;
                selectTable($scope.tables[$scope.tableToDisplay].name);
            })
            .error(function(data) {
                console.log('POST error: ' + data);
            });
    };

    // Asks user for Table name, sends POST request to server to make new table
    $scope.createTable = function() {
        let newTable = prompt('Enter table name');
        $http.post('/api/create/'+ newTable)
            .success(function(data) {
              console.log('Table: '+data);
                $scope.newTableData = {};
                $scope.tables = data;
                selectTable($scope.tables[$scope.tableToDisplay].name);
            })
            .error(function(data) {
                console.log('POST error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete(`/api/todos/${$scope.tableToDisplay}/${id}`)
            .success(function(data) {
              console.log(`deleted: ${id} from ${$scope.tables[$scope.tableToDisplay].name}`);
                $scope.tables = data;
                selectTable($scope.tables[$scope.tableToDisplay].name);
            })
            .error(function(data) {
                console.log('DELETE error: ' + data);
            });
    };

    //Send DELETE request, uses current selected table
    $scope.deleteTable = function() {
        if (confirm(`Do you want to delete ${$scope.tables[$scope.tableToDisplay].name}?`)) {
        $http.delete('/api/tables/'+ $scope.tables[$scope.tableToDisplay].name)
            .success(function(data) {
              console.log('delete: '+data);
                $scope.tables = data;
                selectTable($scope.tables[$scope.tableToDisplay].name);
            })
            .error(function(data) {
                console.log('DELETE error: ' + data);
            });
    };
  };

}; //Controller end
