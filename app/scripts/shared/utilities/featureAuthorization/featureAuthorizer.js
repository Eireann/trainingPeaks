define(
[
    "underscore",
    "shared/utilities/featureAuthorization/accessRights"
],
function(
    _,
    accessRights
         )
{

    function FeatureAuthorizer(user)
    {
        this.user = user;
    }

    _.extend(FeatureAuthorizer.prototype, {

        features: {

            PlanFutureWorkouts: function(user, attributes, options)
            {
                return true;
            }

        },

        canAccessFeature: function(featureChecker, attributes, options)
        {
            if(_.isFunction(featureChecker))
            {
                var returnValue = featureChecker(this.user, attributes, options);
                if(typeof returnValue !== "boolean")
                {
                    throw new Error("Feature checker should return a boolean");
                }
                return returnValue;
            }
            else
            {
                throw new Error("featureChecker should be a function"); 
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
                this.showUpgradeMessage(); 
            }
        },

        showUpgradeMessage: function()
        {
            alert("Not Implemented");
        }

    });

    return FeatureAuthorizer;

});
