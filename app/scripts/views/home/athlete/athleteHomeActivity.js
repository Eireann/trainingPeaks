define(
[
    "underscore",
    "TP",
    "moment",
    "models/workoutsCollection",
    "views/home/scrollableColumnView",
    "hbs!templates/views/home/athlete/athleteHomeActivity"
],
function(
    _,
    TP,
    moment,
    WorkoutsCollection,
    ScrollableColumnView,
    activityTemplate
    )
{
    return ScrollableColumnView.extend(
    {

        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: activityTemplate });

            var now = moment();

            var workouts = new WorkoutsCollection([], { startDate: now.subtract('weeks', 2) , endDate: now.add('weeks', 3) });

            workouts.fetch().done(this.fetchFinished);

        },
        
        fetchFinished: function(e)
        {
            
        }

    });
});