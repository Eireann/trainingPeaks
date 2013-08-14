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
        _createSortDate: function()
        {
            this.sortDate = moment(this.get("date")).format(TP.utils.datetime.shortDateFormat);
        },

        getSortDate: function()
        {
            if(!this.sortDate)
            {
                this._createSortDate();
                this.on("change:date", this._createSortDate, this); 
            }
            return this.sortDate;
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

    var ActivityCollection = TP.Collection.extend(
    {
        model: ActivityModelFactory,

        cacheable: true,

        comparator: function(a, b)
        {
            // later dates come first
            if (a.getSortDate() < b.getSortDate())
            {
                return 1;
            }
            else if (a.getSortDate() > b.getSortDate())
            {
                return -1;

                // days come before models
            }
            else if (a.isDay && !b.isDay)
            {
                return -1;
            }
            else if(b.isDay && !a.isDay)
            {
                return 1;
            }
            else if(a.id < b.id)
            {
                return 1;
            }
            else if(a.id > b.id)
            {
                return -1;
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
            if(!startDate){
                startDate = this.startDate;
            }

            if(!endDate)
            {
                endDate = this.endDate;
            }
        
            var newModels = [];    
            var currentDate = moment(startDate);
            while (currentDate.diff(endDate, "days") <= 0)
            {
                var formattedDate = currentDate.format(TP.utils.datetime.shortDateFormat);
                if (!this.get(formattedDate))
                {
                    var dayModel = new DayModel({ date: formattedDate });
                    this.add(dayModel, options);
                    newModels.push(dayModel);
                }
                else
                {
                    newModels.push(this.get(formattedDate));
                }
                currentDate.add("days", 1);
            }

            // return the models properly sorted 
            return new ActivityCollection(newModels, { startDate: startDate, endDate: endDate }).toArray();
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
            return this.createDayModels(startDate, this.endDate);
        },

        // prepareNext is actually past, at the end of the list
        prepareNext: function(count)
        {
            var weeks = Math.ceil(count / 7);
            var endDate = moment(this.startDate).subtract("days", 1);
            this.startDate = moment(this.startDate).subtract("weeks", weeks);
            return this.createDayModels(this.startDate, endDate);
        }

    });

    return ActivityCollection;
});