define(
[
    "jquery",
    "underscore",
    "backbone",
    "TP",
    "utilities/localStorageUtils",
    "shared/models/dashboardSettingsModel",
    "shared/models/expandoSettingsModel"
],
function(
    $,
    _,
    Backbone,
    TP,
    localStorageUtils,
    DashboardSettingsModel,
    ExpandoSettingsModel
)
{
    return TP.APIDeepModel.extend(
    {
        cacheable: true,

        webAPIModelName: "User",
        idAttribute: "userId",

        defaults:
        {
            address: null,
            address2: null,
            age: 0,
            allowMarketingEmails: null,
            birthday: null,
            cellPhone: null,
            city: null,
            country: null,
            dateFormat: "mdy",
            email: null,
            isEmailVerified: false,
            enablePrivateMessageNotifications: null,
            expireDate: null,
            firstName: null,
            fullName: null,
            gender: null,
            language: null,
            lastName: null,
            latitude: null,
            logonToHtml5: false,
            longitude: null,
            phone: null,
            profilePhotoUrl: null,
            state: null,
            story: null,
            timeZone: null,
            units: 2,
            unitsBySportType: {},
            personId: 0,
            userId: 0,
            userIdentifierHash: "",
            userName: null,
            userType: null,
            zipCode: null,

            settings: {},
            athletes: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user";
        },

        onUserFetchFail: function()
        {
            theMarsApp.featureAuthorizer.showUpgradeMessage({
                onClose: function()
                {
                    theMarsApp.session.logout();
                }
            });
        },

        fetch: function(options)
        {
            var self = this,
            superFetch = function()
            {
                options = _.extend(options,
                {
                    errorHandlers:
                    {
                        402: _.bind(self.onUserFetchFail, self)
                    }
                });

                var ajaxFetchPromise = TP.APIDeepModel.prototype.fetch.call(self, options);
                ajaxFetchPromise.done(function()
                {
                    self.localStorage.setItem("app_user", self.attributes);
                });
                return ajaxFetchPromise;
            };


            // Even if we have a cached user we want to update the data, we just may end up not waiting for it.
            var promise = superFetch();

            if(!_.result(options, "nocache"))
            {
                // If the user is saved in localStorage, immediately set that data
                // to this model and return a resolved deferred.
                // Then do the actual AJAX fetch
                var cachedUser = this.localStorage.getItem('app_user');

                if(cachedUser)
                {
                    try
                    {
                        if(options && options.user && cachedUser.userName !== options.user)
                        {
                            // Our cache is for the wrong user, blow it away.
                            this.localStorage.removeItem('app_user');
                        }
                        else
                        {
                            // Pre-populate the user, and don't wait for the current data before loading the app
                            this.set(cachedUser);
                            this.populateUserModels(cachedUser);
                            promise = $.Deferred().resolve().promise();
                        }
                    }
                    catch(e)
                    {
                        // We were unable to use the cached user, maybe the JSON was invalid, just wait <D-r>
                    }
                }
            }

            return promise;
        },

        initialize: function(options)
        {
            Backbone.Model.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "checkpoint", "revert");

            this.localStorage = (options && options.localStorage) ? options.localStorage : localStorageUtils;
        },
        
        checkpoint: function()
        {
            this.checkpointAttributes = _.clone(this.attributes);
        },
        
        revert: function()
        {
            if(this.checkpointAttributes)
                this.set(this.checkpointAttributes);
        },

        getUnitsBySportType: function(sportType)
        {
            return this.get("unitsBySportType")[parseInt(sportType, 10)] || this.get("units"); 
        },

        setCurrentAthlete: function(athleteSettings)
        {
            var changed = !this.athleteSettings || this.athleteSettings.get("athleteId") !== athleteSettings.get("athleteId");
            this.athleteSettings = athleteSettings;
            if(changed)
            {
                this.trigger("athlete:change");
            }
        },

        getCurrentAthleteId: function()
        {
            return this.getAthleteSettings().get("athleteId");
        },

        getAthleteSettings: function()
        {
            if(!this.hasAthleteSettings())
            {
                throw new Error("User has no athlete settings");
            }
            return this.athleteSettings;
        },

        hasAthleteSettings: function()
        {
            return !!this.athleteSettings;
        },

        getAthleteDetails: function()
        {
            var athleteId = this.getCurrentAthleteId();
            if(!this.athleteDetailsModel || this.athleteDetailsModel.get("athleteId") !== athleteId)
            {
                this.athleteDetailsModel = new TP.Model(_.find(this.get("athletes"), function(athlete)
                {
                    return Number(athlete.athleteId) === Number(athleteId);
                }));
            }
            return this.athleteDetailsModel;
        },

        getAccountSettings: function()
        {
            if(!this.accountSettings)
            {
                this.accountSettings = new TP.Model(this.get("settings.account"));
            }
            return this.accountSettings;
        },

        getAffiliateSettings: function()
        {
            if(!this.affiliateSettings)
            {
                this.affiliateSettings = new TP.Model(this.get("settings.affiliate"));
            }
            return this.affiliateSettings;
        },

        getCalendarSettings: function()
        {
            if(!this.calendarSettings)
            {
                this.calendarSettings = new TP.Model(this.get("settings.calendar"));
            }
            return this.calendarSettings;
        },

        getDashboardSettings: function()
        {
            if(!this.dashboardSettings)
            {
                this.dashboardSettings = new DashboardSettingsModel(this.get("settings.dashboard"));
            }
            return this.dashboardSettings;
        },

        getExpandoSettings: function()
        {
            if(!this.expandoSettings)
            {
                this.expandoSettings = new ExpandoSettingsModel(this.get("settings.expando"));
            }
            return this.expandoSettings;
        },

        getMetricsSettings: function()
        {
            if(!this.metricsSettings)
            {
                this.metricsSettings = new TP.Model(this.get("settings.metrics"));
            }
            return this.metricsSettings;
        },

        getWorkoutSettings: function()
        {
            if(!this.workoutSettings)
            {
                this.workoutSettings = new TP.Model(this.get("settings.workout"));
            }
            return this.workoutSettings;
        },

        getPasswordSettings: function()
        {
            if(!this.passwordSettings)
            {
                this.passwordSettings = new TP.Model();
            }
            return this.passwordSettings;
        },

        isCoach: function()
        {
            return !this.getAccountSettings().get("isAthlete");
        },

        isCoachWithAthletes: function()
        {
            return this.isCoach() && this.has("athletes") && this.get("athletes").length > 0;
        },
        
        populateUserModels: function(data)
        {

            this.getAccountSettings().set(data.settings.account);
            this.getAffiliateSettings().set(data.settings.affiliate);
            this.getCalendarSettings().set(data.settings.calendar);
            this.getDashboardSettings().set(data.settings.dashboard);
            this.getExpandoSettings().set(data.settings.expando);
            this.getMetricsSettings().set(data.settings.metrics);
            this.getWorkoutSettings().set(data.settings.workout);
        },

        parse: function(resp, options)
        {
            if(resp && resp.settings)
            {
                this.populateUserModels(resp);
            }
            return resp;
        },

        // don't save settings or athletes, handle those separately
        toJSON: function(options)
        {
            var attrs = _.clone(this.attributes);
            delete attrs.settings;
            delete attrs.pods;
            return attrs;
        }
        
    });
});
