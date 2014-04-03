var ctrl=angular.module('ctrl',[]);
// start
ctrl.controller('start',['$scope','$timeout','$location',
	function ($scope,$timeout,$location){
		var token = localStorage.getItem('token');
		var target = token ? '/contacts' : '/login';
		$timeout(function() { $location.path(target); }, 1000);
	}
]);
// login
ctrl.controller('login',['$scope','$http','$templateCache','$location','$timeout','project',
	function ($scope,$http,$templateCache,$location,$timeout,project) {
		$scope.method = 'POST';
		$scope.url = 'https://go.salesassist.eu/pim/mobile/';
		$scope.loged = '';
		$scope.params = [];
		$scope.fetch = function() {
			$scope.params['username']=$scope.username;
			$scope.params['password']=$scope.password;
			if($scope.params['username'] && $scope.params['password']){
				$http({method:$scope.method,url:$scope.url,cache:$templateCache,params:$scope.params}).
				success(function(data,status) {
					if(data.code == 'ok'){
						localStorage.setItem('token',data.response);
						localStorage.setItem('username',$scope.params['username']);
						project.setKey();
						$location.path('/contacts');
					}else{
						$scope.alerts=[{type:'error',msg:data.error_code}];
						$timeout(function(){ $scope.closeAlert(0); },3000);
					}
				}).
				error(function(data,status){
					$scope.alerts=[{type:'error',msg:'Server error. Please try later'}];
					$timeout(function(){ $scope.closeAlert(0); },3000);
				});
			}else{
				$scope.alerts=[{type:'error',msg:'Please fill all the fields'}];
				$timeout(function(){ $scope.closeAlert(0); },3000);
			}
		};
		$scope.closeAlert=function(index){$scope.alerts.splice(index,1);}
		$scope.openInBrowser=function(){ window.open('https://go.salesassist.eu', '_system', 'location=yes'); }
	}
]);
// footer
ctrl.controller('footer',['$scope', '$routeParams', '$route', '$modal', 'project', '$location',
	function ($scope, $routeParams, $route, $modal, project,$location){
		
	}
]);
// header
ctrl.controller('header',['$scope','project','$location',
	function ($scope,project,$location){
		$scope.backToList=function(){
			$location.path('/contacts');
		}
	}
]);
// contacts
ctrl.controller('contacts',['$scope','$location','project',
  function ($scope,$location,project){
		$scope.projects = project.contactArr;
		$scope.limit = 30;
		$scope.offset = 0;
		$scope.contacts = 0; 
		$scope.no_project = false;
		project.getContacts().then(function(o){
			$scope.contacts=o.response.max_rows;
			$scope.offset++;
			project.getContactsAsArr();
			if(project.contactArr.length > 0){ $scope.no_project = true; }
		})
		// project.deleteData();	
		// console.log(project.contact);
		$scope.loadMore = function(){
			if($scope.contacts > $scope.limit){
				$scope.limit += 30;
			  project.getContacts($scope.offset).then(function(){
			  	$scope.offset++;
					project.getContactsAsArr();        
				})
			}
		}
		$scope.edit=function(id){ $location.path('/add/'+id); }
  }
]);
// add
ctrl.controller('add',['$scope','project','$location','$routeParams',
	function($scope,project,$location,$routeParams){
		var contact = project.getContact($routeParams.id);		
		$scope.firstname=contact.firstname;
		$scope.lastname=contact.lastname;
		$scope.email=contact.email;
		$scope.phone=contact.phone;
		$scope.company=contact.company_name;
	}
]);
// account
ctrl.controller('account',['$scope', '$location', 'project', '$interval',
    function ($scope, $location, project,$interval){
        $scope.username = localStorage.username;

        //deleting the database
        var removeStuff = function (){
            localStorage.setItem('timesheet', '');
            localStorage.setItem('taskTime', '');
            localStorage.setItem('taskTimeId', '');
            localStorage.setItem('expenses', '');
            localStorage.setItem('toSync', '');
            localStorage.setItem('customers', '');
            project.time = {};
            project.taskTimeId = {};
            project.taskTime = {};
        }
        // removeStuff();
        $scope.logout = function (){
            // $interval.cancel(project.interval);
            localStorage.setItem('username','');
            localStorage.setItem('token','');
            // removeStuff(); // this is for testiung only and shall be removed when going live
            $location.path('/start');
        }
    }
]);