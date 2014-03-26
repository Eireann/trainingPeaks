define(
[
    "underscore",
    "shared/views/userUpgradeView"
],
function(
         _,
         UserUpgradeView
         )
{

    var LightweightFeatureAuthorizer = function(options){

        if(!options || !_.has(options, "userType") || !options.appRoot)
        {
            throw new Error("Lightweight Feature Authorizer requires appRoot and userType");
        }

        this.userType = options.userType;
        this.appRoot = options.appRoot;
    };

    _.extend(LightweightFeatureAuthorizer.prototype, {

        userIsPremium: function()
        {
            return _.contains([1,2,4,5], this.userType);
        },

        features: {
            ViewGraphRanges: function(){ return this.userIsPremium(); },
            ExpandoDataEditing: function(){ return this.userIsPremium(); },
            EditLapNames: false
        },

        canAccessFeature: function(featureChecker, attributes, options){
            if(_.isFunction(featureChecker))
            {
                return featureChecker.call(this, this.userType, attributes, options);
            }
            else
            {
                return !!featureChecker; 
            }
        },

        runCallbackOrShowUpgradeMessage: function(featureChecker, callback, attributes, options)
        {
            if(this.canAccessFeature(featureChecker, attributes, options))
            {
                callback();
            }
            else
            {
                if(this.userType > 0 && !this.userIsPremium())
                {
                    this.showUpgradeMessage(_.extend({ }, featureChecker.options, options));
                }
            }
        },

        showUpgradeMessage: function(options)
        {
            options = options || {};

            _.defaults(options, { userType: this.userType, imageRoot: this.appRoot + "/" });

            if(!this.upgradeView || this.upgradeView.isClosed)
            {
                this.upgradeView = new UserUpgradeView(options);
                this.upgradeView.render();

                if(options.onClose) this.upgradeView.once("close", options.onClose);
            }
        }

    });

    return LightweightFeatureAuthorizer;
});

