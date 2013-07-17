define(
[
    "moment",
    "TP",
    "models/workoutModel"
],
function(moment, TP, WorkoutModel)
{

    var DayModel = TP.Model.extend({
        isDay: true,
        getSortDate: function()
        {
            return this.get("date");
        }
    });

    var ActivityModelFactory = function(modelAttributes)
    {

        if (modelAttributes.hasOwnProperty("workoutId"))
        {
            var model = new WorkoutModel(modelAttributes);
            model.isWorkout = true;
            return model;
        }

        return new TP.Model(modelAttributes);
    };

    return TP.Collection.extend(
    {
        model: ActivityModelFactory,

        cacheable: true,

        comparator: function(a, b)
        {
            // later dates come first
            if (a.getSortDate() < b.getSortDate())
            {
                return 1;
            } else if (a.getSortDate() > b.getSortDate())
            {
                return -1;

                // days come before models
            } else if (a.isDay && !b.isDay)
            {
                return -1;
            } else if(b.isDay && !a.isDay)
            {
                return 1;
            }

            return 0;
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

            this.on("reset", this.createDayModels, this);
        },

        createDayModels: function()
        {
            var currentDate = moment(this.startDate);
            while (currentDate.diff(this.endDate, "days") <= 0)
            {
                var formattedDate = currentDate.format("YYYY-MM-DD");
                if (!this.get(formattedDate))
                {
                    var dayModel = new DayModel({ date: formattedDate, id: formattedDate });
                    this.add(dayModel, { silent: true });
                }
                currentDate.add("days", 1);
            }
        },
        
        parse: function(response, options)
        {
            return response.workouts;
        }

    });
});