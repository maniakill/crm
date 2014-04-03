function Login($scope, $http, $templateCache) {
    $scope.method = 'POST';
    $scope.url = 'https://go.salesassist.eu/pim/mobile/';
    $scope.loged = '';
    $scope.params = [];
     
    $scope.fetch = function() {
        $scope.params['username'] = $scope.username;
        $scope.params['password'] = $scope.password;
        
        if($scope.params['username'] && $scope.params['password']){ 
            $http({method: $scope.method, url: $scope.url, cache: $templateCache, params: $scope.params }).
            success(function(data, status) {
                if(data.code == 'ok'){
                    sessionStorage.token = $scope.token;
                }else{
                    $scope.loged = data.error_code;
                }
            }).
            error(function(data, status) {
               $scope.loged = data.error_code || "Request failed";
            });
        }
    };
     
}