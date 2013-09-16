/*

FeatureAuthorizer

usage: theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.SaveWorkoutToDate, attributes, options);

*/

define(
[
    "underscore",
    "moment",
    "backbone",
    "TP",
    "shared/data/podTypes",
    "shared/utilities/featureAuthorization/accessRights",
    "shared/views/userUpgradeView"
],
function(
    _,
    moment,
    Backbone,
    TP,
    podTypes,
    accessRights,
    UserUpgradeView
         )
{

    function FeatureAuthorizer(user, userAccessRights)
    {
        this.user = user;
        this.userAccessRights = userAccessRights;
    }
   
    _.extend(FeatureAuthorizer.prototype, Backbone.Events);

    _.extend(FeatureAuthorizer.prototype, {

        features: {

            /*
            attributes: { targetDate: date } // the date to try to save to
            options: none
            */
            SaveWorkoutToDate: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.targetDate)
                {
                    throw new Error("SaveWorkoutToDate requires a targetDate attribute");
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
            },

            /*
            attributes: none
            options: none
            */
            ShiftWorkouts: function(user, userAccess, attributes, options)
            {
                var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return _.contains(allowedUserTypes, currentAthleteType);
            },

            /*
            attributes: { podTypeId: int } // matches types in dashboard charts and shared/data/podTypes
            options: { allowUnknownPodTypes: boolean } // allow pod without permission if not defined in podTypes
            */
            ViewPod: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("ViewPod requires a podTypeId attribute");
                }

                try {
                    var podType = podTypes.findById(attributes.podTypeId);
                    var viewablePods = userAccess.getStringList(accessRights.ids.CanViewPods);
                    return _.contains(viewablePods, podType.podAccessString);
                }
                catch(e)
                {
                    if(options && options.allowUnknownPodTypes)
                    {
                        return true;
                    }
                    else
                    {
                        throw e;
                    }
                }

            },

            /*
            attributes: { podTypeId: int } // matches types in dashboard charts and shared/data/podTypes
            options: { allowUnknownPodTypes: boolean } // allow pod without permission if not defined in podTypes
            */
            UsePod: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("UsePod requires a podTypeId attribute");
                }

                try {
                    var podType = podTypes.findById(attributes.podTypeId);
                    var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                    return _.contains(useablePods, podType.podAccessString);
                }
                catch(e)
                {
                    if(options && options.allowUnknownPodTypes)
                    {
                        return true;
                    }
                    else
                    {
                        throw e;
                    }
                }
            },

            /*
            attributes: none
            options: none 
            */
            ElevationCorrection: function(user, userAccess, attributes, options)
            {   
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                return _.contains(useablePods, "journal_GroundControl");
            },

            /*
            attributes: { collection: libraryExercisesCollection } // collection to add to
            options: none 
            */
            AddExerciseToLibrary: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.collection)
                {
                    throw new Error("AddExerciseToLibrary requires a collection attribute");
                }

                var maximumExercises = userAccess.getNumber(accessRights.ids.MaximumExercisesInOwnedLibrary);

                return _.result(attributes.collection, "length") < maximumExercises ? true : false;
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
            if(!this.upgradeView || this.upgradeView.isClosed)
            {
                this.upgradeView = new UserUpgradeView();
                this.upgradeView.render();
            }
        }

    });

    return FeatureAuthorizer;
});
