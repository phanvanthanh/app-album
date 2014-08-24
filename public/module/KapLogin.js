define(['angular', 'module/SharedRegistry'], function(angular) {

    var module = angular.module('KapLogin', ['SharedRegistry']);
    
    module.service('authenticationService', function() {
        
        function authenticationService() {
            var self = this;
            
            var identity = null;
            var userProfile = {};
            
            this.hasIdentity = function() {
                return identity !== null;
            }
            
            this.setIdentity = function(id) {
                identity = id;
            }
            
            this.setUserProfile = function(profile) {
                userProfile = profile;
            }
            
            this.getUserProfile = function() {
                return userProfile;
            }
            
            this.handleResult = function(result) {
                self.setIdentity(result.identityId);
                self.setUserProfile(result.userProfile);
            }
        }
        
        return new authenticationService();
    })

    module.controller('LoginController', function($scope, $http, $timeout, $window, sharedRegistry, authenticationService) {
        var dialog;

        $scope.authenticationOptions = [];

        var result = {
            code: 0,
            identityId: null,
            messages: [],
            userProfile: null
        };

        $scope.status = {
            state: 'NONE',//NONE, IN_PROGRESS, RESULT
            result: null
        }
        
        $scope.authenticationService = authenticationService;

        //init
        $timeout(function() {
            $http.get('/authentication_service').success(function(data) {
                $scope.authenticationOptions = data._embedded.authentication_service.filter(function(item) {
                    return item.enabled;
                });
            });
        });
        
        sharedRegistry.register('LoginController.status', $scope, 'status');

        $scope.$watch('status', function(status) {
            
            if(status.state === 'RESULT') {
                var result = status.result;
                if(!result) {
                    throw "loginController: result not available in status";
                }
                
                authenticationService.handleResult(result);
                
                status.state = 'NONE';
                
                $scope.closeDialog();
            }
            
        }, true);

        //scope functions
        $scope.openDialog = function(option) {
            $scope.status.state = 'IN_PROGRESS';
            
            dialog = $window.open(option._links.redirect_url.href, "Login dialog", "width=1024,height=768,dialog=1,location=1,status=1,minimizable=0,close=0,dependent");
        }

        $scope.closeDialog = function() {
            if(!dialog) {
                return;
            }

            dialog.close();
        }

    });

    module.controller('LoginCallbackController', function($scope, sharedRegistry, loginCallbackResult) {
        
        var status = sharedRegistry.get('LoginController.status');
        
        status.state = 'RESULT';
        status.result = loginCallbackResult;
        
        sharedRegistry.notify('LoginController.status');
        
        $scope.status = status;
    });

    return module;

});