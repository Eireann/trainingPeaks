define(
[
    "moment",
    "TP"
],
function (moment, TP)
{
    return TP.Collection.extend(
    {
        model: TP.Model.extend(
        {
            defaults:
            {
                workoutDay: null,
                tssActual: null,
                tssPlanned: null
            },
        }),

        cacheable: false,

        urlRoot: function ()
        {
            var athleteId = theMarsApp.user.get("athletes.0.athleteId");
            return theMarsApp.apiRoot + "/fitness/v1/athletes/" + athleteId + "/workouts";
        },

        url: function ()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for pmc";

            var start = this.startDate.format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            return this.urlRoot() + "/" + start + "/" + end;
        },

        initialize: function (models, options)
        {
            if (options)
            {
                this.startDate = options.startDate;
                this.endDate = options.endDate;
            }
        }
    });
});