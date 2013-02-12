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
        idAttribute: "PersonId",
        shortDateFormat: "YYYY-MM-DD",
        timeFormat: "Thh:mm:ss",
        longDateFormat: "YYYY-MM-DDThh:mm:ss",

        defaults:
        {
            Language: "",
            CouponCode: "",
            FirstName: "",
            LastName: "",
            PersonId: "",
            Username: "",
            Disciplines: "",
            Services: "",
            Story: "",
            Url: "",
            CoachSpecialty: "",
            CompanyName: "",
            Email: "",
            IsEmailVerified: "",
            City: "",
            State: "",
            Country: "",
            CoachParentId: null,
            IsFeaturedCoach: false,
            MakePublic: false,
            UnitsValue: 0,
            DateFormat: "",
            UserTypeValue: 0,
            CoachedBy: null,
            PhotoFileData: null,
            AthleteTypeValue: 0,
            Age: null,
            Birthday: null
        },
        
        url: function()
        {
            //return theMarsApp.apiRoot + "/WebApiServer/User";
            return "user.json";
        },
        
        initialize: function()
        {
            this.fetch();
        }
    });
});