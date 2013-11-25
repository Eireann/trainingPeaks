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
    "utilities/athlete/userTypes",
    "shared/views/userUpgradeView"
],
function(
    _,
    moment,
    Backbone,
    TP,
    podTypes,
    accessRights,
    userTypes,
    UserUpgradeView
         )
{
    var premiumUserTypes = [
        userTypes.getIdByName("Premium Athlete Paid By Coach"),
        userTypes.getIdByName("Premium Athlete")
    ];

    function userIsPremium(currentAthleteType)
    {
        return _.contains(premiumUserTypes, currentAthleteType);
    }

    function Feature(options, callback) {
        callback.options = options;
        return callback;
    }

    function FeatureAuthorizer(user, userAccessRights)
    {
        this.user = user;
        this.userAccessRights = userAccessRights;
    }
   
    _.extend(FeatureAuthorizer.prototype, {

        features: {

            /*
            attributes: { targetDate: date } // the date to try to save to
            options: none
            */
            SaveWorkoutToDate: Feature({ slideId: "advanced-scheduling" }, function(user, userAccess, attributes, options)
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
            }),

            /*
            attributes: none
            options: none
            */
            ShiftWorkouts: Feature({ slideId: "advanced-scheduling" }, function(user, userAccess, attributes, options)
            {
                var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return _.contains(allowedUserTypes, currentAthleteType);
            }),

            /*
            attributes: { podTypeId: int } // matches types in dashboard charts and shared/data/podTypes
            options: none 
            */
            ViewPod: Feature({}, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("ViewPod requires a podTypeId attribute");
                }

                var podType = podTypes.findById(attributes.podTypeId);
                var viewablePods = userAccess.getStringList(accessRights.ids.CanViewPods);

                return _.contains(viewablePods, podType.podAccessString) || podTypes.getDefaultValue(podType, "ViewPod");
            }),

            /*
            attributes: { podTypeId: int } // matches types in dashboard charts and shared/data/podTypes
            options: none 
            */
            UsePod: Feature({ slideId: "enhanced-analysis" }, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.podTypeId)
                {
                    throw new Error("UsePod requires a podTypeId attribute");
                }

                var podType = podTypes.findById(attributes.podTypeId);
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);

                return _.contains(useablePods, podType.podAccessString) || podTypes.getDefaultValue(podType, "UsePod");
            }),

            /*
            attributes: none
            options: none 
            */
            ExpandoDataEditing: Feature({ slideId: "data-editing" }, function(user, userAccess, attributes, options)
            {   
                var podType = podTypes.findByAccessName("expando_DataEditing");
                return this.features.UsePod(user, userAccess, { podTypeId: podType.podId }, options);
            }),

            /*
            attributes: none
            options: none 
            */
            ElevationCorrection: Feature({ slideId: "elevation-correction" }, function(user, userAccess, attributes, options)
            {   
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                return _.contains(useablePods, "journal_GroundControl");
            }),


            /*
            attributes: none
            options: none 
            */
            ViewGraphRanges: Feature({ slideId: "map-and-graph" }, function(user, userAccess, attributes, options)
            {   
                var useablePods = userAccess.getStringList(accessRights.ids.CanUsePods);
                return _.contains(useablePods, "view_Ranges");
            }),

            /*
            attributes: { collection: libraryExercisesCollection } // collection to add to
            options: none 
            */
            AddWorkoutTemplateToLibrary: Feature({}, function(user, userAccess, attributes, options)
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
            }),

            /*
            attributes: none
            options: none
            */
            ViewICalendarUrl: Feature({}, function(user, userAccess, attributes, options)
            {
                var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return _.contains(allowedUserTypes, currentAthleteType);
            }),

            /*
            attributes: none
            options: none
            */
            AutoApplyThresholdChanges: Feature({}, function(user, userAccess, attributes, options)
            {
                var currentAthleteType = user.getAccountSettings().get("userType");
                return userIsPremium(currentAthleteType);
            }),

            /*
            attributes: none
            options: none
            */
            ViewPlanStore: Feature({}, function(user, userAccess, attributes, options)
            {
                return userAccess.getBoolean(accessRights.ids.HidePlanStoreForCoachedByAthletes) ? false : true;
            }),

            /*
            attributes: none
            options: none
            */
            ReceivePostActivityNotification: Feature({}, function(user, userAccess, attributes, options)
            {
                var currentAthleteType = user.getAccountSettings().get("userType");
                return userIsPremium(currentAthleteType);
            })

        },

        canAccessFeature: function(featureChecker, attributes, options)
        {
            if(_.isFunction(featureChecker))
            {
                var returnValue = featureChecker.call(this, this.user, this.userAccessRights, attributes, options);
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
                this.showUpgradeMessage(_.extend({}, featureChecker.options, options));
            }
        },

        showUpgradeMessage: function(options)
        {
            options = options || {};

            if(!this.upgradeView || this.upgradeView.isClosed)
            {
                this.upgradeView = new UserUpgradeView(options);
                this.upgradeView.render();

                if(options.onClose) this.upgradeView.once("close", options.onClose);
            }
        }

    });

    return FeatureAuthorizer;
});
