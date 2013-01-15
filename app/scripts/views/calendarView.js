define(
[
    "backbone.marionette",
    "Backbone.Marionette.Handlebars",
    "models/calendarDay",
    "views/calendarDayView",
    "hbs!templates/views/calendarWeek"
],
function(Marionette, MarionetteHandlebars, CalendarDayModel, CalendarDayView, CalendarWeekTemplate)
{
    return Marionette.View.extend(
    {
        tagName: "div",

        days:
        {
            
        },
        
        events:
        {
            //"scroll": "onscroll"
        },
        
        initialize: function(options)
        {
            this.startDate = options.startDate;
            this.endDate = options.endDate;
        },
        
        onscroll: function(event)
        {
            // Do we need to scroll yet?
            if (false)
                return;
            
            // Generate more CalendarDayModel's and CalendarDayView's

            // Append to 
            
            if(false)
                this.trigger("request:data");
        },
        
        injectWorkouts: function(workouts)
        {
            for (var i = 0; i < workouts.length; ++i)
            {
                var date = workouts.at(i).get("WorkoutDay");
                date = date.substr(0, date.indexOf("T"));
                
                if (this.days[date])
                {
                    this.days[date].model.set("workoutId", workouts.at(i).get("WorkoutId"));
                }
            }
        },
        
        prependDay: function()
        {
            
        },
        
        addDay: function(dateAsMoment)
        {
            // Assume the dateAsMoment day does not exist yet (FOR NOW)
            
            var displayDate = dateAsMoment;
            var dateString = displayDate.format("LL");
            var dayModel = new CalendarDayModel({ date: dateString });
            var dayView = new CalendarDayView({ el: null, model: dayModel });
            var dayViewsHashKey = displayDate.format("YYYY-MM-DD");
            this.days[dayViewsHashKey] = dayView;

            dayView.render();
        },
        
        addWeek: function(startDayAsMoment)
        {

        },
        
        render: function()
        {
            var numOfDaysToShow = moment(this.endDate).diff(moment(this.startDate), "days");
            var tmpStartDate = moment(this.startDate);
            var daysLeftInWeek = 1;
            var weekHtml = "";

            for (var dayOffset = 0; dayOffset < numOfDaysToShow; dayOffset++)
            {
                if (--daysLeftInWeek === 0)
                {
                    daysLeftInWeek = 7;
                    
                    weekHtml = CalendarWeekTemplate({});
                    $(this.el).append(weekHtml);
                }

                $(document.createElement("div")).css("class", ".day")
                // this.addDay(tmpStartDate);
                
                tmpStartDate.add("days", 1);
            }
                
            return this;
        }
    });
});