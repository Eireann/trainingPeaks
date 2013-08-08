define(
[
    "underscore",
     "TP",
     "views/calendar/calendarHeaderView"
],
function (_, TP, calendarHeaderView)
{

    var calendarControlsHeader =
    {
        showHeader: function ()
        {
            this.layout.headerRegion.show(this.views.header);
        },

        initializeHeader: function ()
        {
            if (this.views.header)
                this.views.header.close();

            if (!this.models.calendarHeaderModel) {
                this.models.calendarHeaderModel = new TP.Model();
            }
            
            this.views.header = new calendarHeaderView({ model: this.models.calendarHeaderModel });

            this.views.header.on("request:today", this.onRequestToday, this);
            this.views.header.on("request:nextweek", this.onRequestNextWeek, this);
            this.views.header.on("request:lastweek", this.onRequestLastWeek, this);
            this.views.header.on("request:refresh", this.onRequestRefresh, this);
            this.views.header.on("request:date", this.onRequestDate, this);
        },

        onRequestDate: function(date) {
            this.showDate(moment(date), 200);
        },
        onRequestLastWeek: function (currentWeekModel)
        {
            this.showDate(moment(this.views.calendar.getCurrentWeek()).subtract("weeks", 1), 200);
        },

        onRequestNextWeek: function(currentWeekModel)
        {
            this.showDate(moment(this.views.calendar.getCurrentWeek()).add("weeks", 1), 200);
        }

    };

    return calendarControlsHeader;
});
