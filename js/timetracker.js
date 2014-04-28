var pos=[]; 
function checkConnection() {
  if(devReady === true){ var networkState = navigator.connection.type; }
  else{ var networkState = 'browser'; }
  return networkState;
}
function getLocation() { if(devReady === true){ navigator.geolocation.getCurrentPosition(onSuccess, onError); } }
function onSuccess(position) { 
  pos.length = 0;
  pos.push(position.coords.latitude);
  pos.push(position.coords.longitude);
}
function onError(error) { alert('code: '+error.code+'\nmessage: '+error.message+'\n'); }
angular.module('fsCordova', [])
.service('CordovaService', ['$document', '$q',
  function($document, $q) {
    var d = $q.defer(), resolved = false; self = this;
    this.ready = d.promise;
    document.addEventListener('deviceready', function() {
      resolved = true;
      d.resolve(window.cordova);
    });
    setTimeout(function() {
      if (!resolved) {
        if (window.cordova) d.resolve(window.cordova);
      }
    }, 3000);
}]);
var app = angular.module('timeT', ['ngRoute','ctrl','angular-gestures','ui.bootstrap']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/',{controller: 'start',templateUrl: 'layout/start.html'})
        .when('/login',{controller: 'login',templateUrl: 'layout/login.html'})
        .when('/login/:error',{controller: 'login',templateUrl: 'layout/login.html'})
        .when('/contacts',{controller: 'contacts',templateUrl: 'layout/contacts.html'})
        .when('/customers',{controller: 'customers',templateUrl: 'layout/contacts.html'})
        .when('/add',{controller: 'add',templateUrl: 'layout/add.html'})
        .when('/add/:id',{controller: 'add',templateUrl: 'layout/add.html'})
        .when('/account',{controller: 'account',templateUrl: 'layout/account.html'})
        .when('/customerV/:id',{controller: 'customerV',templateUrl: 'layout/customerView.html'})
        .when('/map/:id',{controller: 'map',templateUrl: 'layout/map.html'})
        .when('/mapc/:id',{controller: 'map',templateUrl: 'layout/map.html'})
        .otherwise({ redirectTo: '/' });
});
app.factory('project', ['$http','$templateCache','$location','$rootScope','$interval',
  function ($http,$templateCache,$location,$rootScope,$interval) {
    var project = {}, url = 'https://go.salesassist.eu/pim/mobile/', key = 'api_key='+localStorage.token+'&username='+localStorage.username, obj = {},search='';
    /* store data */
    project.getContactsAsArr=function(){
      project.contactArr.length = 0;
      project.customerArr.length = 0;
      angular.forEach(project.contact,function(value,key){ project.contactArr.push(value); })
      angular.forEach(project.customer,function(value,key){ project.customerArr.push(value); })
      project.contactArr.sort(function(a, b){ return (a.lastname === b.lastname ? 0 : (a.lastname < b.lastname ? -1 : 1)); } );
      project.customerArr.sort(function(a, b){ return (a.name === b.name ? 0 : (a.name < b.name ? -1 : 1)); } );
    }
    var init = function(){
      project.contact=localStorage.getItem('contact'+localStorage.username) ? JSON.parse(localStorage.getItem('contact'+localStorage.username)) : {};
      project.customer=localStorage.getItem('customer'+localStorage.username) ? JSON.parse(localStorage.getItem('customer'+localStorage.username)) : {};
      project.contact2C=localStorage.getItem('contact2C'+localStorage.username) ? JSON.parse(localStorage.getItem('contact2C'+localStorage.username)) : {};
      project.contactArr = [];
      project.customerArr = [];
      project.getContactsAsArr();      
    }
    init(); 
    var save = function(type, item){
      if(!localStorage.username){ return false; } if(!type){ return false; } if(!item){ return false; }
      localStorage.setItem(type+localStorage.username, JSON.stringify(item));
    }
    var saveContact = function(item){
      if(item.contact_id){
        var contact={};        
        for(x in item){
          contact[x] = item[x];
        }
        if(contact.company_id!=0 && contact.company_id!=undefined && contact.company_id!='' ){
          if(!project.contact2C[contact.company_id]){ project.contact2C[contact.company_id]=[]; }
          if(project.contact2C[contact.company_id].indexOf(item.contact_id) == -1){
            project.contact2C[contact.company_id].push(item.contact_id);
            save('contact2C',project.contact2C);
          }          
          if(!project.customer[contact.company_id]){
            var c={};
            c.name=contact.company_name;
            c.id=contact.company_id;
            c.comp_phone='';
            c.c_email='';
            project.customer[contact.company_id]=c;
            save('customer',project.customer);
          }
        }
        if(!project.contact[item.contact_id]){ project.contact[item.contact_id]={}; }
        project.contact[item.contact_id] = contact;
        save('contact',project.contact);
      }
    }
    var saveCustomer=function(item){
      if(item.id){
        var customer={};
        for(x in item){
          customer[x] = item[x];
        }
        if(!project.customer[item.id]){ project.customer[item.id]={} }
        project.customer[item.id]=customer;
        save('customer',project.customer);
      }
    }
    project.getContacts = function(off,pag){
      $rootScope.$broadcast('loadingz');
      var offset = off ? off : 0;
      var list = pag ? pag : 'contacts_list';
      this.data = $http.get(url+'index.php?do=mobile-'+list+'&'+key+'&offset='+offset).then(function(response){
        if(response.data.code=='ok'){
          if(typeof(response.data.response.contacts) == 'object' ){
            var contact = response.data.response.contacts;
            angular.forEach(contact, function(value, key){
              saveContact(value);
            });
          }else if(typeof(response.data.response.customers) == 'object'){
            var customer = response.data.response.customers;
            angular.forEach(customer,function(value,key){
              saveCustomer(value);
            })
          }
        }
        if(response.data.code=='error'){ project.logout(response.data); }
        return response.data;
      });
      return this.data;
    }
    project.getItem=function(id,type){
      switch (type){
        case 'customer':
          if(project.customer[id]){ return project.customer[id]; }
          break;
        default:
          if(project.contact[id]){ return project.contact[id]; }
          break;
        }
      return null;
    }
    project.getCustomerContacts=function(id){
      var contacts = [];
      if(project.contact2C[id]){
        angular.forEach(project.contact2C[id],function(value,key){ this.push(project.getItem(value)); },contacts);
      }
      return contacts;
    }
    project.logout = function(code){
        if(code.error_code=='authentication required' || code.error_code=='wrong username'){
            localStorage.setItem('username','');
            localStorage.setItem('token','');
            $location.path('/login/'+code.error_code);
        }// else unknown error!!! and we don't need to relog the user
    }
    project.setKey = function(){ key = 'api_key='+localStorage.token+'&username='+localStorage.username; init(); }
    project.deleteData = function(){ localStorage.clear(); }
    return project;
  }
]);
app.directive('loadMore',['project',function(project){
  return {
    restrict: 'C',
    link:  function(scope,element,attrs){
      element.bind('scroll',function(){
        if(this.scrollTop+this.clientHeight == this.scrollHeight){
          scope.loadMore();
        }
      })
    }  
  }
}]);
