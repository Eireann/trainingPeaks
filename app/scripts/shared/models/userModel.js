﻿define(
[
    "backbone",
    "TP",
    "utilities/localStorageUtils",
    "shared/models/accountSettingsModel",
    "shared/models/athleteSettingsModel",
    "shared/models/dashboardSettingsModel",
    "shared/models/recurringPaymentsCollection",
    "shared/models/paymentHistoryCollection"
],
function(
    Backbone,
    TP,
    localStorageUtils,
    AccountSettingsModel,
    AthleteSettingsModel, 
    DashboardSettingsModel,
    RecurringPaymentsCollection,
    PaymentHistoryCollection
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
            birthday: null,
            cellPhone: null,
            city: null,
            country: null,
            dateFormat: "mdy",
            email: null,
            expireDate: null,
            firstName: null,
            gender: null,
            language: null,
            lastName: null,
            latitude: null,
            longitude: null,
            phone: null,
            profilePhotoUrl: null,
            state: null,
            story: null,
            timeZone: null,
            units: 2,
            userId: 0,
            userName: null,
            zipCode: null,
            zuoraAccountNumber: null,

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

                var ajaxFetch = TP.APIDeepModel.prototype.fetch.call(self, options);
                ajaxFetch.done(function()
                {
                    localStorageUtils.setItem("app_user", self.attributes);
                });
                return ajaxFetch;
            };

            // If the user is saved in localStorage, immediately set that data
            // to this model and return a resolved deferred.
            // Then do the actual AJAX fetch
            var cachedUser = localStorageUtils.getItem('app_user');

            // Even if we have a cached user we want to update the data, we just may end up not waiting for it.
            var promise = superFetch();

            if(cachedUser)
            {
                try
                {
                    if(options && options.user && cachedUser.userName !== options.user)
                    {
                        // Our cache is for the wrong user, blow it away.
                        localStorage.removeItem('app_user');
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

            return promise;
        },

        initialize: function(options)
        {
            Backbone.Model.prototype.initialize.apply(this, arguments);
            _.bindAll(this, "checkpoint", "revert");
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

        setCurrentAthleteId: function(athleteId)
        {
            this.currentAthleteId = athleteId;
            this.trigger("athlete:change");
        },

        getCurrentAthleteId: function()
        {
            return this.currentAthleteId ? this.currentAthleteId : this.getDefaultAthleteId();
        },

        getDefaultAthleteId: function()
        {
            var athletes = this.get("athletes");
            if (!athletes || !athletes.length)
                throw new Error("User has no athletes");

            return athletes[0].athleteId;
        },

        getAthleteSettings: function()
        {
            if(!this.athleteSettings)
            {
                this.athleteSettings = new AthleteSettingsModel({ athleteId: this.getCurrentAthleteId() });
            }
            return this.athleteSettings;
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
                this.accountSettings = new AccountSettingsModel(this.get("settings.account"));
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

        getPaymentHistoryCollection: function()
        {
            if(!this.paymentHistoryCollection)
            {
                this.paymentHistoryCollection = new PaymentHistoryCollection();
            }
            return this.paymentHistoryCollection;
        },

        getRecurringPaymentsCollection: function()
        {
            if(!this.recurringPaymentsCollection)
            {
                this.recurringPaymentsCollection = new RecurringPaymentsCollection();
            }
            return this.recurringPaymentsCollection;
        },

        populateUserModels: function(data)
        {

            this.getAccountSettings().set(data.settings.account);
            this.getAffiliateSettings().set(data.settings.affiliate);
            this.getCalendarSettings().set(data.settings.calendar);
            this.getDashboardSettings().set(data.settings.dashboard);
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
        toJSON: function(options) {
            var attrs = _.clone(this.attributes);
            delete attrs.settings;
            delete attrs.pods;
            return attrs;
        }
        
    });
});
