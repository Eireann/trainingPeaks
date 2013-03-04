define(
[
    "TP"
],
function(TP)
{
    return TP.APIModel.extend(
    {
        cacheable: true,

        webAPIModelName: "User",
        idAttribute: "userId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            address: "",
            address2: "",
            affiliateId: 0,
            age: 0,
            allowMarketingEmails: false,
            birthday: "",
            cellPhone: "",
            city: "",
            colorizeWorkouts: false,
            country: "",
            dateFormat: "",
            email: "",
            enablePrivateMessageNotifications: false,
            expirationDate: "",
            firstName: "",
            gender: null,
            isAthlete: true,
            isEmailVerified: false,
            language: "",
            lastLogon: "",
            lastName: "",
            latitude: null,
            longitude: null,
            numberOfVisits: 0,
            phone: "",
            profilePhotoUrl: "",
            state: "",
            story: "",
            timeZone: "",
            units: 0,
            userId: 0,
            userName: "",
            userType: 0,
            zipCode: "",

            settings: {},
            athletes: []
        },

        url: function()
        {
            return theMarsApp.apiRoot + "/WebApiServer/Users/V1/User";
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
        }
    });
});