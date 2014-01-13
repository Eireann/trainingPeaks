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
    "utilities/athlete/coachTypes",
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
    coachTypes,
    UserUpgradeView
         )
{
    var premiumUserTypes = [
        userTypes.getIdByName("Premium Athlete Paid By Coach"),
        userTypes.getIdByName("Premium Athlete")
    ];

    function userIsPremium(userType)
    {
        return _.contains(premiumUserTypes, userType);
    }

    function Feature(options, callback)
    {
        callback.options = options;
        return callback;
    }

    function FeatureAuthorizer(user, userAccessRights)
    {
        this.user = user;
        this.userAccessRights = userAccessRights;
    }

    function getModelAttributeOrObjectProperty(model, key)
    {
        return _.isFunction(model.get) ? model.get(key) : model[key];
    }

    function userIsCurrentAthleteOrCoach(athleteId, user)
    {
        // user can view their own account
        if(user.get("userId") === athleteId)
        {
            return true;
        }

        // if not a coach, user can only view their own account
        if(user.getAccountSettings().get("isAthlete"))
        {
            return false;
        }

        // athlete must be in athletes list
        var athleteFromUserAthletesList = getAthleteFromUserAthletesList(athleteId, user);

        return athleteFromUserAthletesList ? true : false;
    }

    function getAthleteFromUserAthletesList(athleteId, user)
    {
        return _.find(user.get("athletes"), function(athlete) {
            return getModelAttributeOrObjectProperty(athlete, "athleteId") === athleteId;
        });
    }
   
    _.extend(FeatureAuthorizer.prototype,
    {
        features:
        {
            /*
            attributes: { athlete: athlete } // current app athlete or other athlete object
            options: none
            */
            ViewAthleteCalendar: Feature({ slideId: "advanced-scheduling" }, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.athlete)
                {
                    throw new Error("ViewAthlete requires an athlete attribute");
                }

                var currentUserId = user.get("userId");
                var athleteId = getModelAttributeOrObjectProperty(attributes.athlete, "athleteId");

                // user can view their own account
                if(currentUserId === athleteId)
                {
                    return true;
                }

                // if not a coach, user can only view their own account
                if(user.getAccountSettings().get("isAthlete"))
                {
                    return false;
                }

                // athlete must be in athletes list
                var athleteFromUserAthletesList = _.find(user.get("athletes"), function(athlete) {
                    return getModelAttributeOrObjectProperty(athlete, "athleteId") === athleteId;
                });
                if(!athleteFromUserAthletesList)
                {
                    return false;
                }

                var coachType = user.getAccountSettings().get("coachType");
                
                // ubc coach can view any athlete type
                if(coachType === coachTypes.UBC)
                {
                    return true;
                }

                // non ubc coach can only view premium athletes
                if(coachType === coachTypes.Standard && userIsPremium(getModelAttributeOrObjectProperty(athleteFromUserAthletesList, "userType")))
                {
                    return true;
                }
                else
                {
                    return false;
                }

            }),

            /*
            attributes: { athlete: athlete } // current app athlete or other athlete object
            options: none
            */
            ShareWorkout: Feature({ }, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.athlete)
                {
                    throw new Error("ShareWorkouts requires an athlete attribute");
                }

                // a coach cannot share 
                if(user.getAccountSettings().get("isCoach"))
                {
                    return false;
                }

                // user can only share their own workouts 
                var currentUserId = user.get("userId");
                var athleteId = getModelAttributeOrObjectProperty(attributes.athlete, "athleteId");
                if(currentUserId !== athleteId)
                {
                    return false;
                }


                return true;

            }),

            /*
            attributes: { athlete: athlete } // current app athlete or other athlete object
            options: none
            */
            PlanForAthlete: Feature({ slideId: "advanced-scheduling" }, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.athlete)
                {
                    throw new Error("PlanForAthlete requires an athlete attribute");
                }
                var allowedUserTypes = userAccess.getNumericList(accessRights.ids.CanPlanForUserTypes);
                var athleteUserType = getModelAttributeOrObjectProperty(attributes.athlete, "userType");
                return _.contains(allowedUserTypes, athleteUserType);
            }),

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
                    return this.features.PlanForAthlete(user, userAccess, { athlete: user.getAthleteDetails() }, options);
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
                return this.features.PlanForAthlete(user, userAccess, { athlete: user.getAthleteDetails() }, options);
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
                return this.features.PlanForAthlete(user, userAccess, { athlete: user.getAthleteDetails() }, options);
            }),

            /*
            attributes: none
            options: none
            */
            AutoApplyThresholdChanges: Feature({}, function(user, userAccess, attributes, options)
            {
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return userIsPremium(currentAthleteType);
            }),

            /*
            attributes: none
            options: none
            */
            ViewPlanStore: Feature({}, function(user, userAccess, attributes, options)
            {

                // runnersworld users can always see it
                if("runnersworld" === user.getAffiliateSettings().get("code"))
                {
                    return true;
                }

                // coach-paid premium user, or basic user, with coach can't see it
                if(user.getAccountSettings().get("isCoached"))
                {
                    return false;
                }

                // everybody else can see it
                return true;

            }),

            /*
            attributes: none
            options: none
            */
            ReceivePostActivityNotification: Feature({}, function(user, userAccess, attributes, options)
            {
                var currentAthleteType = user.getAthleteDetails().get("userType");
                return userIsPremium(currentAthleteType);
            }),

            /*
            attributes: athleteId
            options: none
            */
            IsOwnerOrCoach: Feature({}, function(user, userAccess, attributes, options)
            {
                if(!attributes || !attributes.athleteId)                
                {
                    throw new Error("IsOwnerOrCoach requires an athleteId attribute");
                }

                return userIsCurrentAthleteOrCoach(attributes.athleteId, user);

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
