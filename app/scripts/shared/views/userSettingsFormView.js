define(
[
    "underscore",
    "setImmediate",
    "jquerySelectBox",
    "TP",
    "shared/data/athleteTypes",
    "shared/data/countriesAndStates",
    "shared/utilities/formUtility",
    "hbs!shared/templates/userSettingsFormTemplate"
],
function(
    _,
    setImmediate,
    jquerySelectBox,
    TP,
    athleteTypes,
    countriesAndStates,
    FormUtility,
    userSettingsFormTemplate
)
{

    var hours = [
        { data: 0, label: "12:00 AM - 12:59 AM"},
        { data: 1, label: "1:00 AM - 1:59 AM"},       
        { data: 2, label: "2:00 AM - 2:59 AM"},               
        { data: 3, label: "3:00 AM - 3:59 AM"},       
        { data: 4, label: "4:00 AM - 4:59 AM"},               
        { data: 5, label: "5:00 AM - 5:59 AM"},       
        { data: 6, label: "6:00 AM - 6:59 AM"},               
        { data: 7, label: "7:00 AM - 7:59 AM"},               
        { data: 8, label: "8:00 AM - 8:59 AM"},               
        { data: 9, label: "9:00 AM - 9:59 AM"},               
        { data: 10, label: "10:00 AM - 10:59 AM"},               
        { data: 11, label: "11:00 AM - 11:59 AM"},               
        { data: 12, label: "12:00 PM - 12:59 PM"},
        { data: 13, label: "1:00 PM - 1:59 PM"},       
        { data: 14, label: "2:00 PM - 2:59 PM"},               
        { data: 15, label: "3:00 PM - 3:59 PM"},       
        { data: 16, label: "4:00 PM - 4:59 PM"},               
        { data: 17, label: "5:00 PM - 5:59 PM"},       
        { data: 18, label: "6:00 PM - 6:59 PM"},               
        { data: 19, label: "7:00 PM - 7:59 PM"},               
        { data: 20, label: "8:00 PM - 8:59 PM"},               
        { data: 21, label: "9:00 PM - 9:59 PM"},               
        { data: 22, label: "10:00 PM - 10:59 PM"},               
        { data: 23, label: "11:00 PM - 11:59 PM"}
    ];

    var UserSettingsFormView = TP.ItemView.extend(
    {
        
        template:
        {
            type: "handlebars",
            template: userSettingsFormTemplate
        },

        events:
        {
            "click .ical": "onICalFocus"
        },

        initialize: function()
        {
        },

        onRender: function()
        {
            FormUtility.applyValuesToForm(this.$el, this.model, { filterSelector: "[data-modelname=user]" });
            FormUtility.applyValuesToForm(this.$el, this.model.getAthleteSettings(), { filterSelector: "[data-modelname=athlete]" });
            var self = this;
            setImmediate(function()
            {
                self.$("select").selectBoxIt();
            });
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            _.extend(data, {
                athleteTypes: athleteTypes,
                countries: countriesAndStates.countries,
                states: countriesAndStates.states,
                hours: hours,
                timeZones: theMarsApp.timeZones.get("zonesWithLabels"),
                iCalendarKeys: this.model.getAthleteSettings().get("iCalendarKeys"),
                wwwRoot: theMarsApp.apiConfig.wwwRoot
            });

            data.iCalendarKeys.wwwRoot = theMarsApp.apiConfig.wwwRoot.replace("http://","");

            return data;
        },

        onICalFocus: function(e)
        {
            $(e.target).select();
        },

        _save: function()
        {
            FormUtility.applyValuesToModel(this.$el, this.model, { filterSelector: "[data-modelname=user]"});
            FormUtility.applyValuesToModel(this.$el, this.model.getAthleteSettings(), { filterSelector: "[data-modelname=athlete]" });
        }
    });

    return UserSettingsFormView;
});

