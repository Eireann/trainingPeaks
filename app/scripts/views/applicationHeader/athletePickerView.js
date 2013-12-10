define(
[
    "underscore",
    "setImmediate",
    "backbone",
    "TP",
    "hbs!templates/views/applicationHeader/athletePicker"
],
function(
         _,
         setImmediate,
         Backbone,
         TP,
         athletePickerTemplate
         )
{

    var AthletePickerView = TP.ItemView.extend({

        className: "athletePicker",

        template:
        {
            type: "handlebars",
            template: athletePickerTemplate 
        },

        events:
        {
            "change .athleteCalendarSelect": "_onAthleteSelectBoxChange"
        },

        initialize: function(options)
        {
            if(!options || !options.basePath)
            {
                throw new Error("AthletePickerView requires a base path");
            }

            this.listenTo(theMarsApp.user, "change:athletes athlete:change", _.bind(this.render, this));
        },

        onRender: function()
        {
            this._updateCoachAthleteList();
        },

        serializeData: function ()
        {
            return {
                athletes: this._getFilteredAthletesForCoach()
            };
        },

        _updateCoachAthleteList: function()
        {
            if (this._isCoachWithAthletes())
            {
                this._customizeAthleteSelectBox();
                var currentUserId = theMarsApp.user.getCurrentAthleteId();
                this.$(".athleteCalendarSelect").val(currentUserId);
            }
            else
            {
                this.$(".athleteCalendarSelect").remove();
            }
        },

        _isCoachWithAthletes: function()
        {
            return !theMarsApp.user.getAccountSettings().get("isAthlete") && theMarsApp.user.has("athletes") && theMarsApp.user.get("athletes").length > 0;
        },

        _customizeAthleteSelectBox: function()
        {
            var self = this;
            setImmediate(function ()
            {
                self.$(".athleteCalendarSelect").selectBoxIt({
                    dynamicPositioning: false
                });

                self.$(".athleteCalendarSelectSelectBoxItContainer").css('display', "block");
            });
        },

        _onAthleteSelectBoxChange: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "athleteChanged", "eventLabel": "" });

            var athleteId = Number(this.$(".athleteCalendarSelect").val());

            var athleteUrl = this.options.basePath + "/athletes/" + athleteId;
            theMarsApp.router.navigate(athleteUrl, true);
        },

        _getFilteredAthletesForCoach: function()
        {
            var athletes = theMarsApp.user.get("athletes");
            return _.filter(athletes, function(athlete)
            {
                return theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewAthleteCalendar, { athlete: athlete });
            });
        }

    });

    return AthletePickerView;
});
