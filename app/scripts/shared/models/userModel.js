define(
[
    "TP",
    "shared/models/athleteSettingsModel",
    "shared/models/dashboardSettingsModel"
],
function(
         TP, 
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

        getDashboardSettings: function()
        {
            if(!this.dashboardSettings)
            {
                this.dashboardSettings = new DashboardSettingsModel(this.get("settings.dashboard"));
            }
            return this.dashboardSettings;
        },

        parse: function(resp, options)
        {
            this.getDashboardSettings().set(resp.settings.dashboard);
            return resp;
        },

        // don't save settings or athletes, handle those separately
        toJSON: function(options) {
            var attrs = _.clone(this.attributes);
            delete attrs.settings;
            delete attrs.pods;
        }

    });
});