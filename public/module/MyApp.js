define([
    'angular',
    'moment',
    //'angular-strap.tpl',
    //'angular-animate',
    'angular-ui-router',
    'angular-ui-tree',
    'ng-tags-input',
    'textAngular',
    'ngInfiniteScroll',
    'ngImgCrop',
    'ngstorage',
    'ng-preload-src',
    'angular-loading-bar',
    'angular-moment',
    //'angular-ui-sortable',
    'module/kap-hal',
    //'angular-xeditable',
    //'module/KapLogin',
    'module/kap-security',
    'module/KapFileManager',
    'module/ng-darkroom',
    //'module/KapAlbum'
], function(angular, moment) {

    //moment stuff
    //http://momentjs.com/docs/#/customization/calendar/
    moment.lang('en-GB', {
        calendar : {
            lastDay : '[Yesterday]',
            sameDay : '[Today]',
            nextDay : '[Tomorrow]',
            lastWeek : '[last] dddd',
            nextWeek : '[this] dddd',
            sameElse : 'L'
        }
    });
    //END - moment

    var module = angular.module('MyApp', [
        //'ngAnimate',
        //'mgcrea.ngStrap',
        'ui.router',
        'ui.tree',
        'ngTagsInput',
        'textAngular',
        'ng-preload-src',
        'ngImgCrop',
        'ngStorage',
        'angular-loading-bar',
        'angularMoment',
        'infinite-scroll',
        'kap-hal',
        //'xeditable',
        //'KapLogin',
        'KapSecurity',
        'KapFileManager',
        'ng-darkroom'
        //'KapAlbum'
    ]);
    
    module.config(function($stateProvider, $urlRouterProvider, $provide, datepickerConfig, datepickerPopupConfig) {

        angular.extend(datepickerConfig, {
            
        });

        angular.extend(datepickerPopupConfig, {
            datepickerPopup: 'dd/MM/yyyy'
        });
        
        $stateProvider
            .state('app', {
                abstract: true,
                templateUrl: 'template/app.html',
                controller: 'AppController'
            })
            .state('app.home', {
                url: "/home",
                views: {
                    'content': {
                        controller: "AlbumCollectionController",
                        templateUrl: "template/album-collection.html"
                    },
                    'contact': {
                        controller: 'ContactController',
                        templateUrl: 'template/contact.html'
                    }
                },
                albumId: 1
            })
            .state('app.home.album', {
                url: "/album/:albumId",
                views: {
                    'content@app': {
                        controller: "AlbumController",
                        templateUrl: "template/album.html"
                    }
                }
            })
            .state('app.home.tag', {
                url: "/tag/:tagId",
                views: {
                    'content@app': {
                        controller: "TagFilterController",
                        templateUrl: "template/tag-filter.html"
                    }
                }
            })
            .state('app.login', {
                url: "/login",
                templateUrl: "template/KapLogin/login.html",
                controller: 'loginController'
            })

        $urlRouterProvider.otherwise("/home");
        
        //TODO FIX http://stackoverflow.com/questions/21714655/angular-js-angular-ui-router-reloading-current-state-refresh-data
        $provide.decorator('$state', function($delegate, $stateParams) {
            $delegate.forceReload = function() {
                return $delegate.go($delegate.current, $stateParams, {
                    reload: true,
                    inherit: false,
                    notify: true
                });
            };
            return $delegate;
        });
        
    });

    module.run(function($rootScope) {
        //editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
        
    });

    module.factory('apiClient', function(HalClient) {
        var baseUrl = '/';
        var client = new HalClient(baseUrl);
        HalClient.default = client;
        
        return client;
    })
    
    module.controller('AppController', function($rootScope, $scope, $modal, $state, apiClient, authenticationService, $window, $sessionStorage) {

      $sessionStorage.$default({
        edit: false
      });
      
        $rootScope.app = {
            edit: $sessionStorage.edit,
            nav: {
                collapsed: true
            },
            editor: {
                //https://github.com/fraywing/textAngular/wiki/Customising-The-Toolbar
                defaultToolbar: [['bold','italics', 'underline'], ['ul', 'ol'], ['html']]
            }
        };

        $rootScope.auth = authenticationService;

        $rootScope.logout = function() {
            authenticationService.logout();
            $window.location = '/logout';
        }

        $rootScope.login = function() {
            $window.location = '/login';
        }

        $rootScope.toggleEdit = function() {
          
            $rootScope.app.edit = $sessionStorage.edit = !$rootScope.app.edit;
        }

        $rootScope.albumItemUpdate = function(item) {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-item-edit-modal.html',
                controller: 'AlbumItemModalController',
                resolve: {
                    albumItem: function() {
                        return item;
                    }
                },
                size: 'lg'
            });
            
            return modalInstance.result;
        }

        $rootScope.albumItemCreate = function() {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-item-edit-modal.html',
                controller: 'AlbumItemModalController',
                resolve: {
                    albumItem: function() {
                        return {
                            type: 'FILE',
                            file_id: null
                        }
                    }
                },
                size: 'lg'
            });
            
            return modalInstance.result;
        }

        $rootScope.albumItemRelRemove = function(collection, item) {
            return collection.remove(item, true);
        }

        $rootScope.albumCreate = function() {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-edit.html',
                controller: function($scope, $modalInstance, apiClient) {
                    //$scope.item = item;
                    $scope.item = {}

                    $scope.save = function(item) {
                        item.create_time = moment().format('YYYY-MM-DDTHH:mm:ss');
                        apiClient.create('album', item).then(function(data) {
                            $modalInstance.close(data);
                        });
                    }
                },
                size: 'lg'
            });

            return modalInstance.result;
        }

        $rootScope.albumUpdate = function(album) {
            var modalInstance = $modal.open({
                templateUrl: 'template/album-edit.html',
                controller: function($scope, $modalInstance, apiClient) {
                    $scope.item = album;
                    $scope.save = function(item) {
                        apiClient.update('album', item.id, item).then(function(data) {
                            angular.extend(item, data);
                            $modalInstance.close(data);
                        });
                    }
                },
                size: 'lg'
            });

            return modalInstance.result;
        }

        $rootScope.fullScreenGallery = function(albumItems, current) {
            
            var modalInstance = $modal.open({
                templateUrl: 'template/fullscreen-gallery.html',
                controller: function($scope, $modalInstance, apiClient, $sce, $timeout) {
                    var currentIndex = 0;
                    var controlPanelTimer = null;
                    
                    $scope.renderControlPanel = true;
                    $scope.currentItem = null;
                    $scope.albumItems = albumItems;
                    
                    $timeout(function() {
                        $scope.setCurrent(current);
                        
                        runControlPanelTimer();
                    });
                    
                    $scope.showControlPanel = function() {
                        $scope.renderControlPanel = true;
                        runControlPanelTimer();
                    }
                    
                    function runControlPanelTimer() {
                        if(controlPanelTimer) {
                            $timeout.cancel(controlPanelTimer);
                        }

                        controlPanelTimer = $timeout(function() {
                            $scope.renderControlPanel = false;
                        }, 3000);
                    }
                    
                    $scope.nextItem = function() {
                        ++currentIndex;
                        
                        if(currentIndex >= albumItems.length) {
                            currentIndex = 0;
                        }
                        
                        $scope.currentItem = albumItems[currentIndex];
                    }

                    $scope.previousItem = function() {
                        currentIndex--;
                        if(currentIndex < 0) {
                            currentIndex = albumItems.length - 1;
                        }
                        
                        $scope.currentItem = albumItems[currentIndex];
                    }
                    
                    $scope.setCurrent = function(item) {
                        currentIndex = albumItems.indexOf(item);
                        $scope.currentItem = albumItems[currentIndex];
                    }

                    $scope.getYoutubeVideoEmbedUrl = function(albumItem) {
                        var url = 'http://www.youtube.com/embed/' + albumItem.youtube_video_id + '?rel=0&autoplay=1&';
                        return $sce.trustAsResourceUrl(url);
                    }
                },
                windowClass: 'full-screen',
                size: 'lg'
            });

            return modalInstance.result;
        };

        $rootScope.fullScreenGalleryRel = function(albumItemRelCollection, albumItemRel) {
            var items = [];
            var current = null;
            angular.forEach(albumItemRelCollection.items, function(itemRel) {
                var item = itemRel._embedded.album_item;
                if(itemRel === albumItemRel) {
                    current = item;
                }
                items.push(item);
            })
            
            return $rootScope.fullScreenGallery(items, current);
        };

        $rootScope.fullScreenGalleryAlbum = function(album) {
            return apiClient.fetchAll('album_item_rel', {
                    album_id: album.id
                },
                {
                    index: 'ASC'
                }
            ).then(function(data) {
                    var items = [];
                    var current = null;
                    angular.forEach(data._embedded.album_item_rel, function(itemRel) {
                        var item = itemRel._embedded.album_item;
                        items.push(item);
                    })

                    return $rootScope.fullScreenGallery(items, current);
            });
        };
        
    });

  module.controller('AlbumItemModalController', function($scope, $modalInstance, apiClient, albumItem, $http, $q) {
    $scope.item = albumItem;

    $scope.save = function() {

      if($scope.item.id) {
        apiClient.update('album_item', $scope.item.id, $scope.item).then(function(data) {
          angular.extend(albumItem, data);
          $modalInstance.close(albumItem);
        });
        return;
      }

      apiClient.create('album_item', $scope.item).then(function(data) {
        $modalInstance.close(data);
      });
    }

  });
  
  module.directive('albumItemForm', function() {
    return {
      templateUrl: 'template/album-item-form.html',
      scope: {
        item: '='
      },
      controller: 'AlbumItemFormController'
    }
  });

  module.controller('AlbumItemFormController', function($scope, apiClient, $http, $q, globalFileUploader) {
    //$scope.item = albumItem;

    $scope.thumbnails = [];
    $scope.selectedThumbnail = null;

    $scope.selectThumbnailUrl = function(thumb) {
      $scope.selectedThumbnail = thumb;
      $scope.item.thumbnail_file_url = thumb.url;
    }

    $scope.loadYoutubeThumbnails = function() {
      var videoId = $scope.item.youtube_video_id;

      $http.get('http://gdata.youtube.com/feeds/api/videos/' + videoId + '?v=2&alt=json').then(function(data) {
        for(var i in data.data.entry['media$group']['media$thumbnail']) {
          var thumb = data.data.entry['media$group']['media$thumbnail'][i];
          if(thumb['yt$name'] === 'sddefault') {
            $scope.selectThumbnailUrl({
              url: thumb['url']
            });
            return;
          }
        }
      });
    }

    $scope.loadTags = function(query) {
      return apiClient.fetchAll('tag', {
        query: {
          fulltext: query
        }
      }).then(function(data) {
        return data._embedded.tag;
      });
    }

    $scope.tagAdded = function(tag) {
      if(!tag.id) {
        //create new
        apiClient.create('tag', tag).then(function(data) {
          angular.extend(tag, data);
        });
      }
    }
    
    function setThumbnailFile(response) {
      $scope.item.thumbnail_file_id = response.id;
      $scope.item._embedded.thumbnail_file = response;
    }

    $scope.onThumbnailSave = function(blob) {
      globalFileUploader.addToQueue(blob, {
        formData: [{
          filesystem: 'album_item_thumbnail'
        }],
        onSuccess: function(response) {
          setThumbnailFile(response);
        }
      });
      globalFileUploader.uploadItem(blob);
    }
    
    $scope.resetThumbnail = function() {
      apiClient.fetch('file', $scope.item.file_id).then(function(response) {
        setThumbnailFile(response);
      })
    }

    $scope.$watch('item.youtube_video_id', function(newValue, oldValue) {
      if(newValue && newValue !== oldValue) {
        $scope.loadYoutubeThumbnails();
      }
    });

    $scope.$watch('item.file_id', function(newValue, oldValue) {
      if($scope.item.type === 'FILE' && newValue !== oldValue) {
        $scope.item.thumbnail_file_id = newValue;
        apiClient.fetch('file', newValue).then(function(response) {
          setThumbnailFile(response);
        })
      }
    });
    
  });

  module.controller('ContactController', function($scope) {
        $scope.test = 'DDDD';
    });

    module.controller('AlbumController', function($scope, $state,$modal, $stateParams, apiClient, HalCollection, $sce) {
        
        function loader() {
            var self = this;
            
            this.counter = 0;
            this.loading = false;
            
            this.load = function(promise) {
                self.counter++;
                
                promise.then(function() {
                    self.counter--;
                    check();
                });
                
                check();
            }
            
            function check() {
                if(self.counter) {
                    self.loading = true;
                    return;
                }

                self.loading = false;
            }
        }
        
        $scope.loader = new loader();

        var albumId = $stateParams.albumId;
        if(!albumId) {
            albumId = $state.current.albumId;
        }
        
        $scope.loadingAlbum = true;
        $scope.loadingItems = true;
        
        $scope.album = null;
        
        $scope.loader.load(apiClient.fetch('album', albumId).then(function(data) {
            $scope.album = data;
        }));
        
        $scope.albumItemRelCollection = new HalCollection('album_item_rel');
        $scope.loader.load($scope.albumItemRelCollection.fetch({
            query: {
                album_id: albumId
            },
            page_size: 9999,
            order_by: {
                index: 'ASC'
            }
        }));
        
        $scope.treeOptions = {
            dropped: function(e) {
                var nodes = e.dest.nodesScope.$modelValue;

                var source = nodes[e.source.index];
                var dest = nodes[e.dest.index];

                if(source === dest) {
                    return;
                }

                $scope.albumItemRelCollection.updateIndex(source, dest);
            }
        };
        
        $scope.setPrimaryItem = function(album, relItem) {
            apiClient.partialUpdate('album', relItem.album_id, {
                primary_item_id: relItem.album_item_id
            }).then(function(data) {
                angular.copy(data, album);
            });
        }
        
        $scope.createItemAfter = function(relItem) {
            $scope.albumItemCreate().then(function(data) {
                $scope.albumItemRelCollection.createAfter(relItem, {
                    'album_id': albumId,
                    'album_item_id': data.id
                }, true);
            });
        }

        $scope.createItem = function() {
            $scope.albumItemCreate().then(function(data) {
                $scope.albumItemRelCollection.createFirst({
                    'album_id': albumId,
                    'album_item_id': data.id
                }, true);
            });
        }
      
        $scope.bulkUpload = function() {
          var modalInstance = $modal.open({
            templateUrl: 'template/album-bulk-upload-modal.html',
            controller: 'AlbumBulkUploadModalController',
            resolve: {
              album: function() {
                return $scope.album;
              }
            },
            size: 'lg'
          });
          
          modalInstance.result.then(function() {
            $scope.albumItemRelCollection.fetchCurrent();
          });

          return modalInstance.result;
        };
    });
  
    module.controller('AlbumBulkUploadModalController', function($scope, globalFileUploader, album, $modalInstance, apiClient) {
      $scope.uploader = globalFileUploader;
      
      $scope.fileOptions = {
        albumItemFile: true,
        formData: [{
          filesystem: 'album_item'
        }],
        onSuccess: function(response, status, headers) {
          this.albumItem = {
            name: this._file.name,
            type: 'FILE',
            file_id: response.id,
            thumbnail_file_id: response.id
          };
        }
      }
      
      $scope.remove = function(fileItem) {
        if(fileItem.albumItem && fileItem.albumItem.id) {
          apiClient.remove('album_item', fileItem.albumItem.id);
        }
        fileItem.remove();
      }

      $scope.save = function(fileItem) {
        var item = fileItem.albumItem;
        
        if(item.id) {
          apiClient.update('album_item', item.id, item).then(function(data) {
            angular.extend(item, data);
          });
          return;
        }

        apiClient.create('album_item', item).then(function(data) {
          angular.extend(item, data);
          apiClient.create('album_item_rel', {
            album_id: album.id,
            album_item_id: item.id
          });
        });
      }
      
      $scope.saveAll = function() {
        angular.forEach($scope.uploader.queue, function(fileItem) {
          if(!fileItem.albumItem) {
            return;
          }
          
          $scope.save(fileItem);
        });
      }
      
      $scope.close = function() {
        
      }
    });
  
  module.directive('stopEvent', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attr) {
        element.bind('click', function (e) {
          e.stopPropagation();
        });
      }
    };
  });


  module.controller('AlbumCollectionController', function($scope, $state, $modal, $stateParams, apiClient, HalCollection) {

        $scope.albumCollection = HalCollection.createAndFetch('album', {
            order_by: {
                album_time: 'DESC'
            }
        });

//        $scope.treeOptions = {
//            dropped: function(e) {
//                var nodes = e.dest.nodesScope.$modelValue;
//
//                var source = nodes[e.source.index];
//                var dest = nodes[e.dest.index];
//
//                if(source === dest) {
//                    return;
//                }
//
//                $scope.albumItemRelCollection.updateIndex(source, dest);
//            }
//        };

        $scope.createNewAlbum = function(relItem) {
            $scope.albumCreate().then(function(data) {
                $state.go('app.home.album', {albumId: data.id});
            });
        }

    });

    module.controller('TagFilterController', function($scope, $state, $modal, $stateParams, apiClient) {
        $scope.tag = null;
        
        apiClient.fetch('tag', $stateParams.tagId).then(function(tag) {
            $scope.tag = tag;
        });
        
    });

    module.directive('localDateToString', function($filter) {
        function link(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(value) {
                if(value instanceof Date) {
                    return $filter('date')(value, "yyyy-MM-ddT00:00:00'Z'", 'UTC');
                }
                
                return value;
            });

//            ngModel.$formatters.unshift(function(value) {
//                console.log(value); //XXX
//                return $filter('date')(value, "dd/MM/YYYY");
//            });
        }
        
        return {
            require: 'ngModel',
            link: link
        }
    })

    return module;
});