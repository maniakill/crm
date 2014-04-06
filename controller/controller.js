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
ctrl.controller('footer',['$scope','$routeParams','$route','project','$location',
	function ($scope,$routeParams,$route,project,$location){
		$scope.contactsAct = '';
		$scope.contacts = true;
		$scope.customersAct = '';
		$scope.customers = true;
		$scope.accountAct='';
		$scope.account=true;
		switch($route.current.controller){
			case 'customers':
				$scope.customersAct='act';
				$scope.customers=false;
				break;
			case 'account':
				$scope.accountAct='act';
				$scope.account=false;
				break;
			default: 
				$scope.contactsAct='act';
				$scope.contacts=false;
				break;
		}
		$scope.go = function(href){ $location.path('/'+href); }
	}
]);
// header
ctrl.controller('header',['$scope','project','$location','$route',
	function ($scope,project,$location,$route){
		var path=$route.current.controller,link = 'contacts';
		$scope.lists = true;
		switch (path){
			case 'customerV':
				link='customers';
				$scope.lists=false;
				break;
			case 'add':
				link='contacts';
				$scope.lists=false;
				break;
		}
		$scope.backToList=function(){ $location.path('/'+link); }
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
		$scope.loadMore = function(){
			if($scope.contacts > $scope.limit){
				$scope.limit += 30;
			  project.getContacts($scope.offset).then(function(){
			  	$scope.offset++;
					project.getContactsAsArr();
				})
			}
		}
		$scope.getName=function(item){return item.firstname+' '+item.lastname;}
		$scope.edit=function(item){ $location.path('/add/'+item.contact_id); }
  }
]);
// add
ctrl.controller('add',['$scope','project','$location','$routeParams',
	function ($scope,project,$location,$routeParams){
		var contact = project.getItem($routeParams.id);
		$scope.firstname=contact.firstname;
		$scope.lastname=contact.lastname;
		$scope.email=contact.email;
		$scope.phone=contact.phone;
		$scope.company=contact.company_name;
	}
]);
// customers
ctrl.controller('customers',['$scope','project','$location',
	function ($scope,project,$location){
		$scope.projects = project.customerArr;
		$scope.limit = 30;
		$scope.offset = 0;
		$scope.contacts = 0; 
		$scope.no_project = false;
		project.getContacts($scope.offset,'customers_list').then(function(o){
			$scope.contacts=o.response.max_rows;
			$scope.offset++;
			project.getContactsAsArr();
			if(project.customerArr.length > 0){ $scope.no_project = true; }
		})
		// project.deleteData();
		$scope.loadMore = function(){
			if($scope.contacts > $scope.limit){
				$scope.limit += 30;
			  project.getContacts($scope.offset,'customers_list').then(function(){
			  	$scope.offset++;
					project.getContactsAsArr();
				})
			}
		}
		$scope.getName=function(item){ return item.name;}
		$scope.edit=function(item){ $location.path('/customerV/'+item.id); }
	}
])
// account
ctrl.controller('account',['$scope','$location','project',
  function ($scope,$location,project){
    $scope.username = localStorage.username;
    //deleting the database
    var removeStuff = function (){ localStorage.clear(); }
    // removeStuff();
    $scope.logout = function (){
      localStorage.setItem('username','');
      localStorage.setItem('token','');
      $location.path('/start');
    }
  }
]);
// customer View
ctrl.controller('customerV',['$scope','$routeParams','project',
	function ($scope,$routeParams,project){
		var contact = project.getItem($routeParams.id,'customer');
		$scope.name=contact.name;
		$scope.c_email=contact.c_email;
		$scope.comp_phone=contact.comp_phone;
	}
])