﻿define(
[
    "underscore",
    "TP",
    "moment",
    "models/activityCollection",
    "views/home/scrollableColumnView",
    "views/home/athlete/activityCollectionView",
    "hbs!templates/views/home/athlete/athleteHomeActivity"
],
function(
    _,
    TP,
    moment,
    ActivityCollection,
    ScrollableColumnView,
    ActivityCollectionView,
    activityTemplate
    )
{
    return ScrollableColumnView.extend(
    {
        ui:
        {
            activityFeedContainer: "#activityFeedContainer"
        },
        
        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: activityTemplate });

            this.activityCollection = new ActivityCollection(null, { startDate: moment().subtract("weeks", 3), endDate: moment().add("weeks", 1) });
            this.activityCollection.fetch();

            this.activityCollectionView = new ActivityCollectionView({ collection: this.activityCollection });
        },
        
        onRender: function()
        {
            this.activityCollectionView.render();
            this.ui.activityFeedContainer.html(this.activityCollectionView.$el);
        }
    });
});