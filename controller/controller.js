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
			case 'customerV':
				$scope.customersAct='act';
				$scope.customers=false;
				break;
			case 'account':
				$scope.accountAct='act';
				$scope.account=false;
				break;
			case 'map':
				$scope.contactsAct='act';
				$scope.contacts=false;
				if($route.current.originalPath.search('mapc') > -1){ 
					$scope.contactsAct='';
					$scope.contacts=true;
					$scope.customersAct='act';
					$scope.customers=false;
				}
				break
			default: 
				$scope.contactsAct='act';
				$scope.contacts=false;
				break;
		}
		$scope.go = function(href){ $location.path('/'+href); }
	}
]);
// header
ctrl.controller('header',['$scope','project','$location','$route','$routeParams',
	function ($scope,project,$location,$route,$routeParams){
		var path=$route.current.controller,link = 'contacts';
		$scope.lists = true;
		$scope.text = 'List';
		switch (path){
			case 'customerV':
				link='customers';
				$scope.lists=false;
				break;
			case 'add':
				link='contacts';
				$scope.lists=false;
				break;
			case 'map':
				$scope.text = 'Back';
				link='add/'+$routeParams.id;
				if($route.current.originalPath.search('mapc') > -1){ link='customerV/'+$routeParams.id; }
				$scope.lists=false;
				break;
		}
		$scope.backToList=function(){ $location.path('/'+link); }
	}
]);
// contacts
ctrl.controller('contacts',['$scope','$location','project','$interval',
  function ($scope,$location,project,$interval){
  	var loading = false;
		$scope.projects = project.contactArr;
		$scope.limit = 30;
		$scope.offset = 0;
		$scope.contacts = project.contactArr.length; 
		$scope.no_project = false;
		$scope.loadingMore = false;		
		$scope.predicate = 'lastname';
		if(project.contactArr.length > 0){ $scope.no_project = true; }
		project.getContacts().then(function(o){
			if(o.response){
				$scope.contacts=o.response.max_rows;
				$scope.offset++;
				project.getContactsAsArr();
				if(project.contactArr.length > 0){ $scope.no_project = true; }
			}
			$scope.loadingMore = false;
		})		
		$scope.loadMore = function(){
			if(loading === false){
				if($scope.contacts > $scope.limit){
					loading = true;
					$scope.$apply(function(){$scope.limit += 30;});
				  project.getContacts($scope.offset).then(function(){
				  	$scope.offset++;
						project.getContactsAsArr();
						$scope.loadingMore = false;
						loading = false;
					})
				}
			}
		}
		$scope.getName=function(item){ return item.lastname+' '+item.firstname; }
		$scope.edit=function(item){ $location.path('/add/'+item.contact_id); }
		$scope.$on('loadingz', function() { $scope.loadingMore = true;  });
  }
]);
// add
ctrl.controller('add',['$scope','project','$location','$routeParams',
	function ($scope,project,$location,$routeParams){
		var contact = project.getItem($routeParams.id);
		for(x in contact){
			$scope[x] = contact[x];
		}
	}
]);
// customers
ctrl.controller('customers',['$scope','project','$location',
	function ($scope,project,$location){
		var loading = false;
		$scope.projects = project.customerArr;
		$scope.limit = 30;
		$scope.offset = 0;
		$scope.contacts = project.customerArr.length; 
		$scope.no_project = false;
		$scope.loadingMore = false;
		$scope.predicate = 'name';
		if(project.customerArr.length > 0){ $scope.no_project = true; }
		project.getContacts($scope.offset,'customers_list').then(function(o){
			if(o.response){
				$scope.contacts=o.response.max_rows;
				$scope.offset++;
				project.getContactsAsArr();
				if(project.customerArr.length > 0){ $scope.no_project = true; }
			}
			$scope.loadingMore = false;
		})
		// project.deleteData();
		$scope.loadMore = function(){
			if(loading === false){
				if($scope.contacts > $scope.limit){
					loading = true;
					$scope.$apply(function(){$scope.limit += 30;});
				  project.getContacts($scope.offset,'customers_list').then(function(){
				  	$scope.offset++;
						project.getContactsAsArr();
						$scope.loadingMore = false;
						loading = false;
					})
				}
			}
		}
		$scope.getName=function(item){ return item.name;}
		$scope.edit=function(item){ $location.path('/customerV/'+item.id); }
		$scope.$on('loadingz', function() { $scope.loadingMore = true; });
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
ctrl.controller('customerV',['$scope','$routeParams','project','$location',
	function ($scope,$routeParams,project,$location){
		var contact = project.getItem($routeParams.id,'customer');
		for(x in contact){
			$scope[x] = contact[x];
		}
		$scope.projects = project.getCustomerContacts($routeParams.id);		
		$scope.getName=function(item){ return item.lastname+' '+item.firstname; }
		$scope.edit=function(item){ $location.path('/add/'+item.contact_id); }
	}
])
ctrl.controller("map",['$scope','project','$routeParams','$route','geolocation',
	function ($scope,project,$routeParams,$route,geolocation){
		geolocation.getCurrentPosition(function (position) {
    alert('Latitude: '              + position.coords.latitude          + '\n' +
          'Longitude: '             + position.coords.longitude         + '\n' +
          'Altitude: '              + position.coords.altitude          + '\n' +
          'Accuracy: '              + position.coords.accuracy          + '\n' +
          'Altitude Accuracy: '     + position.coords.altitudeAccuracy  + '\n' +
          'Heading: '               + position.coords.heading           + '\n' +
          'Speed: '                 + position.coords.speed             + '\n' +
          'Timestamp: '             + position.timestamp                + '\n');
  });
		// getLocation();
		// var connect = checkConnection();		
		// if(connect == 'none' && connect =='unknown'){ angular.element('#map-canvas span').text('No internet connection'); }
  //   else{
		// 	if($route.current.originalPath.search('mapc') > -1){ var contact = project.getItem($routeParams.id,'customer'), name = contact.name; }
		// 	else{ var contact = project.getItem($routeParams.id), name = contact.lastname+' '+contact.firstname }
		// 	$scope.address = contact.address+','+contact.city+','+contact.zip+','+contact.country;		
		// 	$scope.loadScript = function () {
		// 		if(angular.element('#googleAppended').length == 0){
		// 		  var script = document.createElement('script'), div = document.createElement('div');
		// 		  script.type = 'text/javascript';
		// 		  script.src = encodeURI("https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=codeAddress");
		// 		  div.id='googleAppended';
		// 		  document.body.appendChild(script);
		// 		  document.body.appendChild(div);
		// 		}else{ $scope.codeAddress(); }
		// 	}
		// 	$scope.codeAddress = function () {
		// 		if(pos.length>0){
		// 			var directionsDisplay = new google.maps.DirectionsRenderer();
		// 			var directionsService = new google.maps.DirectionsService();
		// 			var myLatLng = new google.maps.LatLng(pos[0], pos[1]);
		// 			var mapOptions = { zoom: 9, center: myLatLng };
		// 			var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		// 			directionsDisplay.setMap(map);
					
		// 			var geocoder = new google.maps.Geocoder();
		// 			geocoder.geocode( { 'address': $scope.address }, function(results, status) {
		// 		    if (status == google.maps.GeocoderStatus.OK) {
		// 		    	var destLatLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
		// 		    	var request = { origin:myLatLng, destination:destLatLng, travelMode: google.maps.TravelMode.DRIVING };
		// 				  directionsService.route(request, function(response, status) {
		// 				  	if (status == google.maps.DirectionsStatus.OK) {
		// 				      directionsDisplay.setDirections(response);
		// 				    }else{ alert("Direction sevices was not successful for the following reason: "+status); }
		// 				  });
		// 		    }else{ alert("Geocode was not successful for the following reason: " + status); }
		// 		  });
		// 		}else{
		// 		  var geocoder = new google.maps.Geocoder();
		// 		  geocoder.geocode( { 'address': $scope.address }, function(results, status) {
		// 		    if (status == google.maps.GeocoderStatus.OK) {
		// 		    	var mapOptions = { zoom: 9, center: new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng()) };
		// 					var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		// 					var myLatLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
		// 					var marker = new google.maps.Marker({ position: myLatLng, map: map, title: name });
		// 		    }else{ alert("Geocode was not successful for the following reason: " + status); }
		// 		  });
		// 		}
		// 	}
		// }
	}
])
