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
            this.options = options;
            if(!options || !options.basePath)
            {
                throw new Error("AthletePickerView requires a base path");
            }

            this.listenTo(theMarsApp.user, "change:athletes", _.bind(this.render, this));
        },

        onRender: function()
        {
            var currentAthleteId = theMarsApp.user.getCurrentAthleteId();
            this.$("select.athleteCalendarSelect").val(currentAthleteId);
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
            if (theMarsApp.user.isCoachWithAthletes())
            {
                this._customizeAthleteSelectBox();
            }
            else
            {
                this.$(".athleteCalendarSelect").remove();
            }
        },

        _setCurrentUser: function()
        {
            var currentAthleteId = theMarsApp.user.getCurrentAthleteId();
            this.$("select.athleteCalendarSelect").val(currentAthleteId).selectBoxIt("refresh");
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

                self._setCurrentUser();
                self.listenTo(theMarsApp.user, "athlete:change", _.bind(self._setCurrentUser, self));
            });
        },

        _onAthleteSelectBoxChange: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "calendar", "eventAction": "athleteChanged", "eventLabel": "" });

            var athleteId = this.$(".athleteCalendarSelect").val();

            var athleteUrl = this.options.basePath + "/athletes/" + athleteId;
            theMarsApp.router.navigate(athleteUrl, true);
        },

        _getFilteredAthletesForCoach: function()
        {
            var currentAthleteId = theMarsApp.user.getCurrentAthleteId();
            var athletes = _.clone(theMarsApp.user.get("athletes"));
            return _.filter(athletes, function(athlete)
            {
                if(athlete.athleteId === currentAthleteId)
                {
                    athlete.selected = true;
                }
                return theMarsApp.featureAuthorizer.canAccessFeature(theMarsApp.featureAuthorizer.features.ViewAthleteCalendar, { athlete: athlete });
            });
        }

    });

    return AthletePickerView;
});
