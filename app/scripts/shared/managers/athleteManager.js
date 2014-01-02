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

    function AthleteManager(app, user)
    {
        this.app = app;
        this.user = user;
        this.athletes = {};
    }

    _.extend(AthleteManager.prototype, {


        loadAthlete: function(athleteId)
        {
            if(!this._userHasAthlete(athleteId))
            {
                throw new Error("Athlete " + athleteId + " is not in user's athletes list");
            }

            var athlete = this._getOrCreateAthlete(athleteId); 
            var user = this.user;

            return $.when(athlete.getFetchPromise(), athlete.getEquipment().fetch())
                .done(function()
                {
                    user.setCurrentAthlete(athlete);
                });
        },

        _getOrCreateAthlete: function(athleteId)
        {
            var athlete = _.has(this.athletes, athleteId) ? this.athletes[athleteId] : new AthleteSettingsModel({ athleteId: athleteId});
            this.athletes[athleteId] = athlete;
            return athlete;
        },

        _userHasAthlete: function(athleteId)
        {
            return _.find(this.user.get("athletes"), function(athlete)
                {
                    return athlete.athleteId === athleteId;
                });
        }


    });

    return AthleteManager;
});
