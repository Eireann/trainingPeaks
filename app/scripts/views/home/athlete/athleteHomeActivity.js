define(
[
    "underscore",
    "setImmediate",
    "TP",
    "moment",
    "models/activityCollection",
    "views/home/scrollableColumnView",
    "views/activityFeed/activityCollectionView",
    "hbs!templates/views/activityFeed/activityFeedContainer"
],
function(
    _,
    setImmediate,
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

        scrollDownThresholdInPx: 500,
        scrollUpThresholdInPx: 300,

        ui:
        {
            activityFeedContainer: "#activityFeedContainer"
        },
        
        initialize: function(options)
        {
            // initialize the superclass
            this.constructor.__super__.initialize.call(this, { template: activityTemplate });

            this.startDate = moment().subtract("weeks", 3);
            this.endDate = moment().add("weeks", 1);

            _.bindAll(this, "beforeAppend", "afterAppend", "beforePrepend", "afterPrepend");

            this.pages = [];
        },

        onRender: function()
        {
            var self = this;
            this.requestActivities(this.startDate, this.endDate, "append").done(function() { self.afterInitialLoad(); });
        },

        requestActivities: function(startDate, endDate, appendOrPrepend)
        {
            var activityCollection = new ActivityCollection(null, { startDate: startDate, endDate: endDate });
            var fetchPromise = activityCollection.fetch({ reset: true });

            var self = this;
            fetchPromise.done(function()
            {
                var activityCollectionView = new ActivityCollectionView({ collection: activityCollection });
                if (appendOrPrepend === "append")
                {
                    self.appendPage(self.ui.activityFeedContainer, activityCollectionView);
                }
                else
                {
                    self.prependPage(self.ui.activityFeedContainer, activityCollectionView);
                }
            });

            return fetchPromise;
        },

        appendPage: function(containerElement, view)
        {
            view.render();
            containerElement.append(view.$el);
            this.pages.push(view);
        },

        prependPage: function(containerElement, view)
        {
            view.render();
            containerElement.prepend(view.$el);
            this.pages.unshift(view);
            var newCollectionHeight = view.$el.height();
            var currentScrollTop = this.scrollableContainer.scrollTop();
            this.scrollableContainer.scrollTop(currentScrollTop + newCollectionHeight);
        },

        afterInitialLoad: function()
        {
            var self = this;
            var callback = function()
            {
                self.listenForScroll();
            };
            this.scrollToElement("#" + moment().add("days", 1).format("YYYY-MM-DD"), null, 300, callback);
        },

        listenForScroll: function()
        {
            this.on("scroll:top", this.onScrollToTop, this);
            this.on("scroll:bottom", this.onScrollToBottom, this);
            this.on("scroll:updatePosition", this.onUpdateScrollPosition, this);
        },
        
        onScrollToTop: function()
        {
            if (!this.prepending)
            {
                this.beforePrepend();
                var self = this;

                // FIXME: may not be correct
                var currentEndDate = this.endDate;

                var requestStartDate = moment(this.endDate).add("days", 1);
                this.endDate = moment(this.endDate).add("weeks", 1);
                this.requestActivities(requestStartDate, this.endDate, "prepend").done(function()
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

                var requestEndDate = moment(this.startDate).subtract("days", 1);
                this.startDate = moment(this.startDate).subtract("weeks", 2);
                this.requestActivities(this.startDate, requestEndDate, "append").done(function()
                {
                    self.afterAppend();
                });
            }
        },

        beforeAppend: function()
        {
            this.appending = true;
            /*
            if (!this.$appendWait)
            {
                this.$appendWait = $("<div>").addClass("waitingForInfiniteScroll");
                this.ui.activityFeedContainer.append(this.$appendWait);
            }

            this.$appendWait.show();
            */
        },

        afterAppend: function(scrollToDate)
        {
            //this.$appendWait.hide();
            this.appending = false;
        },

        beforePrepend: function()
        {
            this.prepending = true;
            /*
            if(!this.$prependWait)
            {
                this.$prependWait = $("<div>").addClass("waitingForInfiniteScroll");
                this.ui.activityFeedContainer.prepend(this.$prependWait);
            }
            this.$prependWait.show();
            */
        },

        afterPrepend: function(scrollToDate)
        {
            //this.$prependWait.hide();
            this.prepending = false;
        }

    });
});