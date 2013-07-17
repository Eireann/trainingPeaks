define(
[
    "moment",
    "TP",
    "models/workoutModel"
],
function(moment, TP, WorkoutModel)
{
    return TP.Collection.extend(
    {
        model: TP.Model,

        cacheable: true,

        comparator: function(item)
        {
            return item.getSortDate();
        },
            
        urlRoot: function()
        {
            var athleteId = theMarsApp.user.getCurrentAthleteId();
            return theMarsApp.apiRoot + "/baseactivity/v1/athletes/" + athleteId + "/baseactivities";
        },

        url: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for ActivityCollection";

            var start = this.startDate.format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            return this.urlRoot() + "/" + start + "/" + end;
        },

        initialize: function(models, options)
        {
            if (!options || !options.startDate || !options.endDate)
                throw "ActivityCollection requires startDate and endDate";
            
            this.startDate = options.startDate;
            this.endDate = options.endDate;

            var numOfDays = this.startDate.diff(this.endDate, "days");
            for (var i = 0; i < numOfDays; i++)
            {
                var dayModel = new TP.Model({ date: moment(this.startDate).add("days", i) });
                dayModel.isDay = true;
                this.add(dayModel, { silent: true });
            }
        },
        
        parse: function(response, options)
        {
            return  response.workouts;
        }
    });
});