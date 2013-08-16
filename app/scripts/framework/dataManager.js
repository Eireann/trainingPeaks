define(
[
    "underscore",
    "backbone.marionette"
], function(
    _,
    Marionette
    )
{

    var DataManager = function(options)
    {
        this.resetPatterns = options && options.resetPatterns ? options.resetPatterns : [];
        this.ignoreResetPatterns = options && options.ignoreResetPatterns ? options.ignoreResetPatterns : [];
        this._resolvedRequests = {};
        this._pendingRequests = {};
    };

    _.extend(DataManager.prototype, {

        reset: function(modelUrl)
        {
            if(this._shouldReset(modelUrl))
            {
                this._resolvedRequests = {};
                this._pendingRequests = {};
            }
        },

        fetch: function(modelOrCollection, options)
        {
            var requestSignature = this._getRequestSignature(modelOrCollection);

            if(this._hasResolvedData(requestSignature))
            {
                return this._resolveRequestWithExistingData(requestSignature, modelOrCollection, new $.Deferred());
            }
            else
            {
                return this._requestData(requestSignature, modelOrCollection, options);
            }
        },

        _getRequestSignature: function(modelOrCollection)
        {
            if(!_.isUndefined(modelOrCollection.requestSignature))
            {
                return _.result(modelOrCollection, "requestSignature");
            }
            else
            {
                return _.result(modelOrCollection, "url");
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

        _resolveRequestWithExistingData: function(requestSignature, modelOrCollection, deferred)
        {
            modelOrCollection.set(this._resolvedRequests[requestSignature]);
            deferred.resolve();
            return deferred;
        },

        _resolveAllPendingRequests: function(requestSignature)
        {
            var requests = this._pendingRequests[requestSignature];
            delete this._pendingRequests[requestSignature];
            _.each(requests, function(request)
            {
                this._resolveRequestWithExistingData(requestSignature, request.modelOrCollection, request.deferred); 
            }, this);
        },

        _requestData: function(requestSignature, modelOrCollection, options)
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
        }

    });

    DataManager.extend = Marionette.extend;

    return DataManager;

});