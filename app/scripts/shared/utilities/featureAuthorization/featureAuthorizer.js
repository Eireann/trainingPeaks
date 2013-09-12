/*

FeatureAuthorizer

usage: theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.PlanFutureWorkouts, attributes, options);

*/

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

    function FeatureAuthorizer(user, userAccessRights)
    {
        this.user = user;
        this.userAccessRights = userAccessRights;
    }

    _.extend(FeatureAuthorizer.prototype, {

        features: {
            PlanFutureWorkouts: function(user, userAccess, attributes, options)
            {
                var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return _.contains(allowedUserTypes, currentAthleteType);
            }
        },

        canAccessFeature: function(featureChecker, attributes, options)
        {
            if(_.isFunction(featureChecker))
            {
                var returnValue = featureChecker(this.user, this.userAccessRights, attributes, options);
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
            alert("Beautiful marketing message not yet implemented. Upgrade your account to use this feature.");
        }

    });

    return FeatureAuthorizer;
});
