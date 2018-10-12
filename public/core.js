// public/core.js
var toDoApp = angular.module('toDoApp', []);

function mainController($scope, $http) {
    $scope.tables = [{tableName: "General", toDo: ["haha heck ok","wowe","nice"],},{tableName: "Website", toDo: ["haha heck ok","wowe"],},{tableName: "Shopping", toDo: ["haha heck ok","wowe","nice"],}];

    $scope.formData = {};
    $scope.formData = {name: "jack",};

    // when landing on the page, get all todos and show them
    $http.get('/api/todos')
        .success(function(data) {
            $scope.todos = data;
            console.log($scope.todos);
        })
        .error(function(data) {
            console.log('GET error: ' + data);
        });

    // when submitting the add form, send the text to the node API
    $scope.createTodo = function() {
        $http.post('/api/todos', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.todos = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('POST error: ' + data);
            });
    };

    $scope.createTable = function() {
        $http.post('/api/create', {tableName: "Shopping"})
            .success(function(data) {
                console.log(data);
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
                console.log(data);
            })
            .error(function(data) {
                console.log('DELETE error: ' + data);
            });
    };

}
