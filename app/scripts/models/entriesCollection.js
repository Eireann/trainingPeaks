define(
[
    "moment",
    "TP"
],
function(moment, TP)
{
    return TP.Collection.extend(
    {

        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts";
        },

        url: function(options)
        {
            if (!(options.startDate && options.endDate))
                throw new Error("startDate & endDate needed for WorkoutsCollection");

            var start = options.startDate.format(TP.utils.datetime.shortDateFormat);
            var end = moment(options.endDate).format(TP.utils.datetime.shortDateFormat);

            return this.urlRoot() + "/" + start + "/" + end;
        },

        fetch: function(options) 
        {
            TP.Collection.prototype.fetch.call(this, this.url(options));
        }
    });
});