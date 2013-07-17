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
            console.log(url);
            return url;
        },

        initialize: function(models, options)
        {
            if (!options || !options.startDate || !options.endDate)
                throw "ActivityCollection requires startDate and endDate";

            this.startDate = options.startDate;
            this.endDate = options.endDate;

            this.on("reset", function() { this.createDayModels(this.startDate, this.endDate, { silent: true }); }, this);
        },

        // fetches a week in the future, at the top of activity feed
        prependWeek: function()
        {
            var requestStartDate = moment(this.endDate).add("days", 1);
            var requestEndDate = moment(this.endDate).add("weeks", 1);
            return this.requestMoreDays(requestStartDate, requestEndDate);
        },

        // fetches a week in the past, at the bottom of activity feed
        appendWeek: function()
        {
            var requestEndDate = moment(this.startDate).subtract("days", 1);
            var requestStartDate = moment(this.startDate).subtract("weeks", 1);
            return this.requestMoreDays(requestStartDate, requestEndDate);
        },

        requestMoreDays: function(requestStartDate, requestEndDate)
        {
            var fetchPromise = this.fetch({ remove: false, url: this.url(requestStartDate, requestEndDate) });
            var self = this;
            fetchPromise.done(function()
            {
                self.createDayModels(requestStartDate, requestEndDate);
                if (moment(requestStartDate).diff(moment(self.startDate), "days") < 0)
                {
                    self.startDate = moment(requestStartDate);
                }
                if (moment(requestEndDate).diff(moment(self.endDate), "days") > 0)
                {
                    self.endDate = moment(requestEndDate);
                }
            });

            return fetchPromise;
        },

        createDayModels: function(startDate, endDate, options)
        {
            var currentDate = moment(startDate);
            while (currentDate.diff(endDate, "days") <= 0)
            {
                var formattedDate = currentDate.format("YYYY-MM-DD");
                if (!this.get(formattedDate))
                {
                    var dayModel = new DayModel({ date: formattedDate, id: formattedDate });
                    this.add(dayModel, options);
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