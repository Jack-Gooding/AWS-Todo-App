// public/core.js

var toDoApp = angular.module('toDoApp', []);

function mainController($scope, $http) {
    $scope.tables = [{name: "General", toDo: [],},];
    $scope.formData = {};
    $scope.formData = {name: "jack",};
    $scope.selectTable = function(index) {
      $scope.tableToDisplay = index;
      console.log(index)
    };
    // when landing on the page, get all todos and show them
    $http.get('/api/todos/')
        .success(function(data) {
            $scope.tables = data;
            console.log(data);
            console.log("scope: "+$scope.tables);
        })
        .error(function(data) {
            console.log('GET error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos/'+$scope.tableToDisplay, $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log('todos: ' +data);
            })
            .error(function(data) {
                console.log('POST error: ' + data);
            });
    };

    $scope.createTable = function() {
        $http.post('/api/create', {tableName: "Shopping"})
            .success(function(data) {
                $scope.tables.push({tableName: data, toDo: [],});
                console.log('Table: '+data);
            })
            .error(function(data) {
                console.log('POST error: ' + data);
            });
    };

    // delete a todo after checking it
    $scope.deleteTodo = function(id) {
        $http.delete('/api/todos/' + id)
            .success(function(data) {
                $scope.todos = data;
                console.log('delete: '+data);
            })
            .error(function(data) {
                console.log('DELETE error: ' + data);
            });
    };

}
