define(
[
    "backbone",
    "TP",
    "shared/models/accountSettingsModel",
    "shared/models/athleteSettingsModel",
    "shared/models/dashboardSettingsModel"
],
function(
         Backbone,
         TP,
         AccountSettingsModel,
         AthleteSettingsModel, 
         DashboardSettingsModel
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

            settings: {},
            athletes: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/users/v1/user";
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
            return _.find(this.get("athletes"), function(athlete)
            {
                return athlete.athleteId === athleteId;
            });
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
        },

        savePassword: function(password)
        {
            var ajaxOptions = {
                url: this.url() + "/auth",
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify({ text: password })
            };
            return Backbone.ajax(ajaxOptions);
        }

    });
});