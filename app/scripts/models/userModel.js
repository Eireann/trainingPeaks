define(
[
    "TP",
    "models/athleteSettingsModel"
],
function(TP, AthleteSettingsModel)
{
    return TP.APIModel.extend(
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
            units: 0,
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
                throw "User has no athletes";

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
        }
    });
});