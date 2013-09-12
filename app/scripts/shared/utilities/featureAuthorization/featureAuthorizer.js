/*

FeatureAuthorizer

usage: theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.PlanFutureWorkouts, attributes, options);

*/

define(
[
    "underscore",
    "moment",
    "TP",
    "shared/utilities/featureAuthorization/accessRights"
],
function(
    _,
    moment,
    TP,
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
                if(!attributes || !attributes.targetDate)
                {
                    throw new Error("PlanFutureWorkouts requires a targetDate attribute");
                }
                var today = moment().format(TP.utils.datetime.shortDateFormat);
                var newDate = moment(attributes.targetDate).format(TP.utils.datetime.shortDateFormat);

                if(newDate > today)
                {
                    var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                    var currentAthleteType = user.getAthleteDetails().get("userType");
                    return _.contains(allowedUserTypes, currentAthleteType);
                }
                else
                {
                    return true;
                }
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
