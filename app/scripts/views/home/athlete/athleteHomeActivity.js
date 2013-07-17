define(
[
    "underscore",
    "TP",
    "moment",
    "models/activityCollection",
    "views/home/scrollableColumnView",
    "views/activityFeed/activityCollectionView",
    "hbs!templates/views/activityFeed/activityFeedContainer"
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
            var self = this;
            this.activityCollection.fetch({ reset: true }).done(function() { self.afterInitialLoad(); });

            this.activityCollectionView = new ActivityCollectionView({ collection: this.activityCollection });

            _.bindAll(this, "beforeAppend", "afterAppend", "beforePrepend", "afterPrepend");

        },

        afterInitialLoad: function()
        {
            var self = this;
            var callback = function()
            {
                self.listenForScroll();
            }
            this.scrollToElement("#" + moment().add("days", 1).format("YYYY-MM-DD"), null, 300, callback);
        },

        listenForScroll: function()
        {
            this.on("scroll:top", this.onScrollToTop, this);
            this.on("scroll:bottom", this.onScrollToBottom, this);
        },
        
        onRender: function()
        {
            this.activityCollectionView.render();
            this.ui.activityFeedContainer.append(this.activityCollectionView.$el);
        },

        onScrollToTop: function()
        {
            if (!this.prepending)
            {
                this.beforePrepend();
                var self = this;
                var currentEndDate = this.activityCollection.endDate;
                this.activityCollection.prependWeek().done(function()
                {
                    self.afterPrepend(moment(currentEndDate).add("days", 1));
                });
            }
        },

        onScrollToBottom: function()
        {
            if (!this.appending)
            {
                this.beforeAppend();
                var self = this;
                var currentStartDate = this.activityCollection.startDate;
                this.activityCollection.appendWeek().done(function()
                {
                    self.afterAppend(moment(currentStartDate).subtract("days", 1));
                });
            }
        },

        beforeAppend: function()
        {
            if (!this.$appendWait)
            {
                this.$appendWait = $("<div>").addClass("infiniteScroll").addClass("waiting");
                this.ui.activityFeedContainer.append(this.$appendWait);
            }

            this.$appendWait.show();
            this.appending = true;
        },

        afterAppend: function(scrollToDate)
        {
            this.$appendWait.hide();
            this.scrollToElement("#" + scrollToDate.format("YYYY-MM-DD"), null, 0);
            this.appending = false;
        },

        beforePrepend: function()
        {
            if(!this.$prependWait)
            {
                this.$prependWait = $("<div>").addClass("infiniteScroll").addClass("waiting");
                this.ui.activityFeedContainer.prepend(this.$prependWait);
            }

            this.$prependWait.show();
            this.prepending = true;
        },

        afterPrepend: function(scrollToDate)
        {
            this.$prependWait.hide();
            this.scrollToElement("#" + scrollToDate.format("YYYY-MM-DD"), null, 0);
            this.prepending = false;
        }

    });
});