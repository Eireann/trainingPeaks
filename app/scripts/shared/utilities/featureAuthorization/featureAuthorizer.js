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
            options: none 
            */
            ViewPod: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("ViewPod requires a podTypeId attribute");
                }

                var podType = podTypes.findById(attributes.podTypeId);
                var viewablePods = userAccess.getStringList(accessRights.ids.CanViewPods);
                return _.contains(viewablePods, podType.podAccessString);
            },

            /*
            attributes: { podTypeId: int } // matches types in dashboard charts and shared/data/podTypes
            options: none 
            */
            UsePod: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("UsePod requires a podTypeId attribute");
                }

                var podType = podTypes.findById(attributes.podTypeId);
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                return _.contains(useablePods, podType.podAccessString);
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
            attributes: none
            options: none 
            */
            ViewGraphRanges: function(user, userAccess, attributes, options)
            {   
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                return _.contains(useablePods, "view_Ranges");
            },

            /*
            attributes: { collection: libraryExercisesCollection } // collection to add to
            options: none 
            */
            AddWorkoutTemplateToLibrary: function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.collection)
                {
                    throw new Error("AddWorkoutTemplateToLibrary requires a collection attribute");
                }

                var filteredCollection = attributes.collection.filter(function(model)
                {
                    return model.get("itemType") === model.itemTypeIds.WorkoutTemplate;
                });

                return _.result(filteredCollection, "length") < userAccess.getNumber(accessRights.ids.MaximumWorkoutTemplatesInOwnedLibrary);
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

        showUpgradeMessage: function(onClose)
        {
            if(!this.upgradeView || this.upgradeView.isClosed)
            {
                this.upgradeView = new UserUpgradeView();
                this.upgradeView.render();

                this.upgradeView.once("close", onClose);
            }
        }

    });

    return FeatureAuthorizer;
});
