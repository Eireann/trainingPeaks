define(
[
    "underscore",
    "backbone",
    "TP",
    "framework/identityMap"
], function(
    _,
    Backbone,
    TP,
    IdentityMap
    )
{

    var DataManager = function(options)
    {
        this.identityMap = options && options.identityMap || new IdentityMap();
        this.resetPatterns = options && options.resetPatterns ? options.resetPatterns : [];
        this.ignoreResetPatterns = options && options.ignoreResetPatterns ? options.ignoreResetPatterns : [];
        this._resolvedRequests = {};
        this._pendingRequests = {};
    };

    _.extend(DataManager.prototype, Backbone.Events);
    
    _.extend(DataManager.prototype, {

        reset: function(modelUrl)
        {
            if(this._shouldReset(modelUrl))
            {
                this.forceReset();
            }
        },

        forceReset: function()
        {
            this._resolvedRequests = {};
            this._pendingRequests = {};
            this.trigger("reset");
        },

        loadCollection: function(klass, options)
        {
            var self = this;
            var temporaryCollection = new klass([], options);
            var collection = new klass([], options);

            var promise = this._fetch(temporaryCollection, options).then(function() {
                var models = temporaryCollection.map(_.bind(self.identityMap.updateSharedInstance, self.identityMap));
                collection.set(models);
            });

            promise.collection = collection;

            return promise;
        },

        loadModel: function(klass, attributes, options)
        {
            var model = new klass(attributes, options);
            var sharedModel = this.identityMap.getSharedInstance(model);

            var promise;

            if (model === sharedModel)
            {
                // Identity map did not have this model
                promise = this._fetch(sharedModel, options);
            }
            else
            {
                // Identity map had a shared version of this model
                promise = new $.Deferred().resolve().promise();
            }

            promise.model = sharedModel;
            return promise;
        },

        fetchAjax: function(requestSignature, options)
        {
            if(this._hasResolvedData(requestSignature))
            {
                //console.log("Resolving existing request " + requestSignature);
                return this._resolveAjaxRequestWithExistingData(requestSignature, new $.Deferred());
            }
            else
            {
                //console.log("Requesting new data " + requestSignature);
                return this._requestAjaxData(requestSignature, options);
            }
        },

        _fetch: function(modelOrCollection, options)
        {
            var requestSignature = _.result(modelOrCollection, "url");

            if(this._hasResolvedData(requestSignature))
            {
                //console.log("Resolving existing request " + requestSignature);
                return this._resolveRequestOnModelWithExistingData(requestSignature, modelOrCollection, new $.Deferred());
            }
            else
            {
                //console.log("Requesting new data " + requestSignature);
                return this._requestDataOnModel(requestSignature, modelOrCollection, options);
            }
        },

        _shouldReset: function(modelUrl)
        {
            if(!modelUrl)
            {
                return true;
            }

            var ignoreable = _.any(this.ignoreResetPatterns, function(matcher)
            {
                return matcher.test(modelUrl);
            });

            var resettable = _.any(this.resetPatterns, function(matcher)
            {
                return matcher.test(modelUrl);
            });

            return resettable && !ignoreable;
        },

        _hasResolvedData: function(requestSignature)
        {
            return this._resolvedRequests.hasOwnProperty(requestSignature);
        },

        _resolveAllPendingRequests: function(requestSignature)
        {
            var requests = this._pendingRequests[requestSignature];
            delete this._pendingRequests[requestSignature];
            _.each(requests, function(request)
            {
                if(request.modelOrCollection)
                {
                    this._resolveRequestOnModelWithExistingData(requestSignature, request.modelOrCollection, request.deferred); 
                }
                else
                {
                    this._resolveAjaxRequestWithExistingData(requestSignature, request.deferred);
                }
            }, this);
        },

        _resolveRequestOnModelWithExistingData: function(requestSignature, modelOrCollection, deferred)
        {
            modelOrCollection.set(this._resolvedRequests[requestSignature]);
            deferred.resolve();
            return deferred;
        },

        _requestDataOnModel: function(requestSignature, modelOrCollection, options)
        {

            var deferred = new $.Deferred();
            var request = {
                modelOrCollection: modelOrCollection,
                deferred: deferred
            };

            if(!this._pendingRequests.hasOwnProperty(requestSignature))
            {
                this._pendingRequests[requestSignature] = [];
                this._pendingRequests[requestSignature].push(request);
                var self = this;
                options = _.extend({}, options);
                var originalSuccess = options.success ? options.success : null;

                options.success = function(modelOrCollection, response, options)
                {
                    var parsedData = modelOrCollection.parse(response);
                    self._resolvedRequests[requestSignature] = parsedData;

                    if(originalSuccess)
                    {
                        originalSuccess(modelOrCollection, response, options);
                    }

                    self._resolveAllPendingRequests(requestSignature);
                }; 

                modelOrCollection.fetch(options);
            } else {
                this._pendingRequests[requestSignature].push(request);
            }

            return deferred;
        },

        _resolveAjaxRequestWithExistingData: function(requestSignature, deferred)
        {
            var data = this._resolvedRequests[requestSignature];
            deferred.resolve(data);
            return deferred;
        },

        _requestAjaxData: function(requestSignature, options)
        {
            var deferred = new $.Deferred();
            var request = {
                options: options,
                deferred: deferred
            };

            if(!this._pendingRequests.hasOwnProperty(requestSignature))
            {
                this._pendingRequests[requestSignature] = [];
                this._pendingRequests[requestSignature].push(request);
                var self = this;
                Backbone.ajax(options).done(function(data)
                {
                    self._resolvedRequests[requestSignature] = data;
                    self._resolveAllPendingRequests(requestSignature);
                }); 

            } else {
                this._pendingRequests[requestSignature].push(request);
            }

            return deferred;
        }

    });

    DataManager.extend = TP.extend;
    return DataManager;

});
