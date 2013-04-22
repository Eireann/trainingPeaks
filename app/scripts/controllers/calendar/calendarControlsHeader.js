define(
[
     "TP",
     "views/calendar/calendarHeaderView"
],
function (TP, calendarHeaderView

    )
{

    var calendarControlsHeader = {

        showHeader: function ()
        {
            this.layout.headerRegion.show(this.views.header);
        },

        initializeHeader: function ()
        {
            if (this.views.header)
                this.views.header.close();

            this.models.calendarHeaderModel = new TP.Model();

            this.views.header = new calendarHeaderView({ model: this.models.calendarHeaderModel });

            this.views.header.on("request:today", this.onRequestToday, this);
            this.views.header.on("request:nextweek", this.onRequestNextWeek, this);
            this.views.header.on("request:lastweek", this.onRequestLastWeek, this);
            this.views.header.on("request:refresh", this.onRequestRefresh, this);
        },

        onRequestLastWeek: function (currentWeekModel)
        {
            // header has end of week, our showDate wants start of week ...
            this.showDate(moment(currentWeekModel.get("date")).subtract("days", 6).subtract("weeks", 1), 200);
        },

        onRequestNextWeek: function (currentWeekModel)
        {
            // header has end of week, our showDate wants start of week ...
            this.showDate(moment(currentWeekModel.get("date")).add("days", 1), 200);
        }

    };

    return calendarControlsHeader;
});