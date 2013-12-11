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
    }

    _.extend(AthleteManager.prototype, {


        loadAthlete: function(athleteId)
        {
            if(this.user.currentAthleteId !== athleteId)
            {

                if(!_.find(this.user.get("athletes"), function(athlete)
                    {
                        return athlete.athleteId === athleteId;
                    })
                )
                {
                    throw new Error("Athlete " + athleteId + " is not in user's athletes list");
                }

                var self = this;
                var athleteSettings = new AthleteSettingsModel({ athleteId: athleteId });
                return athleteSettings.fetch()
                    .done(function()
                    {
                        self.user.setCurrentAthlete(athleteId, athleteSettings);
                    });
            }
            else
            {
                return new $.Deferred().resolve();
            }
        }


    });

    return AthleteManager;
});
