define(
[
    "moment",
    "TP",
    "models/workoutModel"
],
function(moment, TP, WorkoutModel)
{

    var DayModel = TP.Model.extend({
        idAttribute: "date",
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

        throw "ActivityModelFactory unknown model type";
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

        url: function(requestStartDate, requestEndDate)
        {
            if (!requestStartDate)
            {
                requestStartDate = this.startDate;
            }

            if (!requestEndDate)
            {
                requestEndDate = this.endDate;
            }

            if (!(requestStartDate && requestEndDate))
                throw "startDate & endDate needed for ActivityCollection";

            var start = moment(requestStartDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(requestEndDate).format(TP.utils.datetime.shortDateFormat);

            var url = this.urlRoot() + "/" + start + "/" + end;
            //console.log(url);
            return url;
        },

        initialize: function(models, options)
        {
            if (!options || !options.startDate || !options.endDate)
                throw "ActivityCollection requires startDate and endDate";

            this.startDate = options.startDate;
            this.endDate = options.endDate;
        },

        createDayModels: function(startDate, endDate, options)
        {
            var currentDate = moment(startDate);
            while (currentDate.diff(endDate, "days") <= 0)
            {
                var formattedDate = currentDate.format(TP.utils.datetime.shortDateFormat);
                if (!this.get(formattedDate))
                {
                    var dayModel = new DayModel({ date: formattedDate });
                    this.add(dayModel, options);
                }
                currentDate.add("days", 1);
            }
        },
        
        parse: function(response, options)
        {
            return response.workouts;
        },

        // previous is actually future, at the top of the list
        preparePrevious: function(count)
        {
            var weeks = Math.ceil(count / 7);
            var startDate = moment(this.endDate).add("days", 1);
            this.endDate = moment(this.endDate).add("weeks", weeks);
            this.createDayModels(startDate, this.endDate);
        },

        // prepareNext is actually past, at the end of the list
        prepareNext: function(count)
        {
            var weeks = Math.ceil(count / 7);
            var endDate = moment(this.startDate).subtract("days", 1);
            this.startDate = moment(this.startDate).subtract("weeks", weeks);
            this.createDayModels(this.startDate, endDate);
        }

    });
});