define(
[
    "shared/models/activityModel"
],
function(
    ActivityModel
)
{
    function CalendarMoveShiftManager(activities, days, weeks)
    {
        this.activitiesCollection = activities;
        this.daysCollection = days;
        this.weeksCollection = weeks;

        this.initializeMoveAndShift();
    }
    
    _.extend(CalendarMoveShiftManager.prototype, {

        initializeMoveAndShift: function()
        {
            this.daysCollection.on("workout:added", this.addItem, this);
            this.weeksCollection.on("add", this.subscribeToWeekMoveAndShift, this);
        },

        subscribeToWeekMoveAndShift: function(weekCollection)
        {
            weekCollection.on("week:shiftwizard", this.onShiftWizardOpen, this);
        },

        onItemMoved: function(options)
        {
            if (!options.hasOwnProperty('ItemId') || !options.ItemId ||
                !options.hasOwnProperty('destinationCalendarDayModel') || !options.destinationCalendarDayModel)
            {
                theMarsApp.logger.debug("CalendarCollection.onItemMoved: missing ItemId or destinationCalendarDayModel attribute?");
                return;
            }

            // get the item
            var item = this.activitiesCollection.get(options.ItemType + ":" + options.ItemId);
            item = ActivityModel.unwrap(item);
            item.moveToDay(options.destinationCalendarDayModel.id);
        },

        onDayMoved: function(options)
        {
            if (!options.hasOwnProperty('ItemId') || !options.ItemId ||
                !options.hasOwnProperty('destinationCalendarDayModel') || !options.destinationCalendarDayModel)
            {
                theMarsApp.logger.debug("CalendarCollection.onItemMoved: missing ItemId or destinationCalendarDayModel attribute?");
                return;
            }

            // get the item
            var sourceDayModel = this.daysCollection.get(options.ItemId);
            var item = null;

            while (sourceDayModel.itemsCollection.length > 0)
            {
                item = sourceDayModel.itemsCollection.pop();
                item = ActivityModel.unwrap(item);
                item.moveToDay(options.destinationCalendarDayModel.id);
            }

            options.destinationCalendarDayModel.trigger("day:click", options.destinationCalendarDayModel, $.Event());
        },

        onShiftWizardOpen: function()
        {
            var self = this;
            var openTheWizard = function()
            {
                self.trigger("shiftwizard:open");
            };

            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ShiftWorkouts, 
                openTheWizard
            );
            
        }
    });

    return CalendarMoveShiftManager;
});
