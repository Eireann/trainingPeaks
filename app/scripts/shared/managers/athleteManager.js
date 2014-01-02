define(
[
    "jquery",
    "underscore",
    "shared/models/athleteSettingsModel"
],
function(
    $,
    _,
    AthleteSettingsModel
         )
{

    function AthleteManager(app, user, options)
    {
        this.app = app;
        this.user = user;
        this.athletes = {};

        this.featureAuthorizer = options.featureAuthorizer;
    }

    _.extend(AthleteManager.prototype, {


        loadAthlete: function(athleteId)
        {
            var athlete = this._getOrCreateAthlete(athleteId); 

            if(this._userCanAccessAthlete(athlete))
            {
                var user = this.user;
                return $.when(athlete.getFetchPromise(), athlete.getEquipment().fetch())
                    .done(function()
                    {
                        user.setCurrentAthlete(athlete);
                    });
            }
            else
            {
                return new $.Deferred().reject();
            }
        },

        getCurrentOrDefaultAthleteId: function()
        {
            if(this.user.hasAthleteSettings())
            {
                var athlete = this.user.getAthleteSettings();
                if(this._userCanAccessAthlete(athlete))
                {
                    return athlete.get("athleteId");
                }
            }

            return this.getDefaultAthleteId();
        },

        getDefaultAthleteId: function()
        {
            var athletes = this._getUserAthletes();

            return athletes && athletes.length ? athletes[0].athleteId : null;
        },

        _getOrCreateAthlete: function(athleteId)
        {
            var athlete = _.has(this.athletes, athleteId) ? this.athletes[athleteId] : new AthleteSettingsModel({ athleteId: athleteId});
            this.athletes[athleteId] = athlete;
            return athlete;
        },

        _getUserAthletes: function()
        {
            return _.filter(this.user.get("athletes"), function(athlete)
            {
                return this._userCanAccessAthlete(athlete);
            }, this);
        },

        _userCanAccessAthlete: function(athlete)
        {
            return this.featureAuthorizer.canAccessFeature(this.featureAuthorizer.features.ViewAthleteCalendar, { athlete: athlete });
        }


    });

    return AthleteManager;
});
