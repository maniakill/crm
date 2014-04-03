var app = angular.module('timeT', ['ngRoute','ctrl','ui.bootstrap']);
app.config(function ($routeProvider) {
    $routeProvider
        .when('/',{controller: 'start',templateUrl: 'layout/start.html'})
        .when('/login',{controller: 'login',templateUrl: 'layout/login.html'})
        .when('/login/:error',{controller: 'login',templateUrl: 'layout/login.html'})
        .when('/contacts',{controller: 'contacts',templateUrl: 'layout/contacts.html'})
        .when('/add',{controller: 'add',templateUrl: 'layout/add.html'})
        .when('/add/:id',{controller: 'add',templateUrl: 'layout/add.html'})
        .when('/account',{controller: 'account',templateUrl: 'layout/account.html'})
        .otherwise({ redirectTo: '/' });
});
app.factory('project', ['$http','$templateCache','$location','$rootScope','$interval',
  function ($http,$templateCache,$location,$rootScope,$interval) {
    var project = {}, url = 'https://go.salesassist.eu/pim/mobile/', key = 'api_key='+localStorage.token+'&username='+localStorage.username, obj = {},search='';
    /* store data */
    project.getContactsAsArr=function(){
      angular.forEach(project.contact,function(value,key){
        if(project.contactArr.indexOf(value) == -1){
          project.contactArr.push(value);  
        }        
      })      
    }
    var init = function(){
      project.contact = localStorage.getItem('contact'+localStorage.username) ? JSON.parse(localStorage.getItem('contact'+localStorage.username)) : {};
      project.contactArr = [];
      project.getContactsAsArr();
    }
    init(); 
    var save = function(type, item){
      if(!localStorage.username){ return false; } if(!type){ return false; } if(!item){ return false; }
      localStorage.setItem(type+localStorage.username, JSON.stringify(item));
    }
    var saveContact = function(item){
      var contact={};
      contact.contact_id=item.id;
      contact.firstname=item.firstname;
      contact.lastname=item.lastname;
      contact.email=item.email;
      contact.phone=item.phone;
      contact.company_id=item.company_id;
      contact.company_name=item.company_name;
      if(!project.contact[item.id]){
        project.contact[item.id] = contact;
        save('contact',project.contact);
      }
    }
    project.getContacts = function(off){
      var offset = off ? off : 0;
        this.data = $http.get(url+'index.php?do=mobile-contacts_list&'+key+'&offset='+offset).then(function(response){
          if(response.data.code=='ok'){
            if(typeof(response.data.response.contacts) == 'object' ){
              var contact = response.data.response.contacts;
              angular.forEach(contact, function(value, key){
                saveContact(value);
              });
            }
          }
          if(response.data.code=='error'){ project.logout(response.data); }
          return response.data;
        });
        return this.data;
    }
    project.getContact=function(id){
      if(project.contact[id]){
        return project.contact[id];
      }
      return null;
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
app.directive('scroller',['project',function(project){
  return {
    restrict: 'C',
    link:  function(scope,element,attrs){
      element.bind('scroll',function(){
        if(this.scrollTop == this.scrollTopMax){
          scope.loadMore();
        }
      })
    }  
  }
}]);