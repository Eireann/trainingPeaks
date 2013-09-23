define(
[
    "backbone",
    "TP",
    "shared/models/accountSettingsModel",
    "shared/models/athleteSettingsModel",
    "shared/models/dashboardSettingsModel",
    "shared/models/recurringPaymentsCollection",
    "shared/models/paymentHistoryCollection"
],
function(
    Backbone,
    TP,
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
            address: "",
            address2: "",
            age: 0,
            birthday: "",
            cellPhone: "",
            city: "",
            country: "",
            dateFormat: "",
            email: "",
            expireDate: "",
            firstName: "",
            gender: null,
            language: "",
            lastName: "",
            latitude: null,
            longitude: null,
            phone: "",
            profilePhotoUrl: "",
            state: "",
            story: "",
            timeZone: "",
            units: 2,
            userId: 0,
            userName: "",
            zipCode: "",
            zuoraAccountNumber: null,

            settings: {},
            athletes: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user";
        },

        fetch: function()
        {
            var self = this,
                superFetch = function()
                {
                    var ajaxFetch = TP.APIDeepModel.prototype.fetch.call(self);
                    ajaxFetch.done(function()
                    {
                        localStorage.setItem('app_user', self.toJSON());
                    });
                    return ajaxFetch;
                };

            // If the user is saved in localStorage, immediately set that data
            // to this model and return a resolved deferred.
            // Then do the actual AJAX fetch
            var localStorageUser = localStorage.getItem('app_user'),
                returnDeferred;
            if (localStorageUser)
            {
                returnDeferred = superFetch();
                try {
                    this.set(JSON.parse(localStorageUser));
                    returnDeferred = $.Deferred().resolve();
                } catch(e) {
                    // if the user refreshes the page while the user is being written to localStorage, it will break the next time you try to read that key.
                    // Here, we return superFetch() deferred because parsing localStorage didn't work
                }
                
                return returnDeferred;
            }
            else
            {
                return superFetch();
            }
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

        setCurrentAthleteId: function(athleteId, silent)
        {
            this.currentAthleteId = athleteId;

            if (!silent)
            {
                this.trigger("athlete:change");
            }
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
                    return athlete.athleteId === athleteId;
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

        parse: function(resp, options)
        {
            if(resp && resp.settings)
            {
                this.getAccountSettings().set(resp.settings.account);
                this.getAffiliateSettings().set(resp.settings.affiliate);
                this.getCalendarSettings().set(resp.settings.calendar);
                this.getDashboardSettings().set(resp.settings.dashboard);
                this.getMetricsSettings().set(resp.settings.metrics);
                this.getWorkoutSettings().set(resp.settings.workout);
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