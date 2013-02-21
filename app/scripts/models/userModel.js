define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.APIModel.extend(
    {

        webAPIModelName: "User",
        idAttribute: "personId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            personId: "",
            userId: "",

            firstName: "",
            lastName: "",
            userName: "",
            athleteType: "",
            birthday: "",
            gender: "",
            email: "",
            address: "",
            address2: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            phone: "",
            cellPhone: "",
            profilePhotoUrl: "",
            age: null,
            
            unitsValue: 0,
            dateFormat: "",
            timeZone: "",
            affiliadeId: null,
            allowMarketingEmails: false,
            colorizeWorkouts: false,
            couponCode: "",
            enablePrivateMessageNotifications: false,
            expireDate: "",
            isAthlete: false,
            isEmailVerified: false,
            language: "",
            lastLogon: "",
            latitude: "",
            longitude: "",
            numberOfVisits: 0,
            story: "",
            userTypeValue: 0,

            settings: {},
            accountSettings: {},
            workoutSettings: [],
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