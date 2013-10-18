define(
[
    "underscore",
    "TP",
    "controllers/expandoController"
],
function (_, TP, ExpandoController)
{
    var workoutQVExpand =
    {
        initializeExpand: function()
        {
            _.extend(this.events, this.expandEvents);
            this.on("close", this.closeExpandedView, this);

            this.watchForSensorData();

        },

        watchForSensorData: function()
        {
            if(!this.isNewWorkout)
            {
                this.once("render", this.addExpandWaiting, this);
            }
            var detailData = this.model.get("detailData");
            detailData.watchForSensorData();
            detailData.on("changeSensorData", this.updateExpandButton, this);
            this.on("render", this.updateExpandButton, this);
            this.on("detailData:fetched", this.removeExpandWaiting, this);
        },

        closeExpandedView: function()
        {
            if (this.expandoController)
                this.expandoController.close();

            if(this.expandoRegion)
                this.expandoRegion.close();

            this.model.get("detailData").off("changeSensorData", this.updateExpandButton, this);
        },

        expandEvents:
        {
            "click #quickViewExpandDiv": "expandClicked",
            "click #expandIcon": "expandClicked",
            "click #quickViewCollapseDiv": "collapseClicked",
            "click #collapseIcon": "collapseClicked"
        },

        renderExpandedView: function()
        {
            if(!this.expandoController)
            {

                //TODO Needs some refactor: should be initialized somewhere else?
                this.expandoRegion = new TP.Region(
                {
                    el: this.$("#quickViewExpandedContent")
                });

                this.expandoController = new ExpandoController({ model: this.model, workoutModel: this.workoutModel, workoutDetailsModel: this.workoutDetailsModel, prefetchConfig: this.prefetchConfig });
                this.expandoRegion.show(this.expandoController.getLayout());
            }
            this.expandoController.expand();
        },

        expandClicked: function ()
        {
            if (!this.model.get("detailData").hasSensorData())
                return;

            TP.analytics("send", { "hitType": "event", "eventCategory": "quickView", "eventAction": "expandClicked", "eventLabel": "" });

            this.expanded = true;
            this.renderExpandedView();

            var windowHeight = $(window).height();
            var windowWidth = $(window).width();

            this.originalPosition = this.$el.position();
            this.originalPosition.height = this.$el.height();
            this.originalPosition.width = this.$el.width();

            this.animateOneStepExpansion(windowHeight, windowWidth);
        },

        animateOneStepExpansion: function(windowHeight, windowWidth)
        {
            var newHeight = windowHeight - 20;
            var newWidth = windowWidth - 40;
            var left = 20;
            var top = 20;

            var self = this;
            var afterExpanding = function()
            {
                //TODO Use CSS classes instead of manually setting css attributes in here
                self.$el.addClass("expanded");
                self.$(".expandButton").hide();
                self.$(".collapseButton, .expandedViewsButtons").show();
                self.$("#quickViewExpandedContent").show();

                self.centerViewInWindow();
            };

            var animateExpansion = function()
            {
                var expandDuration = 300;

                //TODO or better, add a class to the main qv container - .expanded or .collapsed
                self.$("#workOutQuickView").animate({ height: newHeight, width: newWidth }, { duration: expandDuration });
                self.$(".tabNavigation, #quickViewContent, .quickviewFooter, #menuIcon, #expandIcon").hide();
                self.$("#collapseIcon").show();

                self.$el.animate({ top: top + "px", left: left + "px", height: newHeight + "px", width: newWidth + "px" },
                {
                    duration: expandDuration, complete: afterExpanding
                });
            };

            animateExpansion();
        },

        collapseClicked: function ()
        {
            TP.analytics("send", { "hitType": "event", "eventCategory": "expando", "eventAction": "collapseClicked", "eventLabel": "" });

            this.expanded = false;
            this.resetTabRenderedState();
            this.animateOneStepCollapse();
        },

        animateOneStepCollapse: function()
        {
            var self = this;

            var afterCollapsing = function()
            {
                //TODO Separation of concerns: quickViewContent needs to show/hide itself through BB View.
                self.$("#menuIcon").show();
                self.$("#expandIcon").show();
                self.$("#collapseIcon").hide();
                self.$("#workOutQuickView").css({ height: self.originalPosition.height, width: self.originalPosition.width });
                self.$(".collapseButton, .expandedViewsButtons").css({ display: "none" });
                self.$(".tabNavigation, .quickviewFooter, .expandButton").css({ display: "block" });
                self.$("#quickViewContent").css({ display: "block" });
                self.centerViewInWindow();
            };

            var collapseDuration = 300;
            this.expandoController.collapse();

            this.$el.removeClass("expanded");

            this.$el.animate({
                height: this.originalPosition.height,
                width: this.originalPosition.width,
                top: this.originalPosition.top + "px",
                left: this.originalPosition.left + "px"
            },
            {
                duration: collapseDuration,
                complete: afterCollapsing
            });                   
        },

        onWindowResize: function()
        {

            if (this.expanded)
            {
                var windowWidth = $(window).width();
                var windowHeight = $(window).height();
                var newHeight = windowHeight - 20;
                var newWidth = windowWidth - 40;

                this.$("#workOutQuickView").width(newWidth).height(newHeight);
                this.$el.width(newWidth).height(newHeight);
            }

            this.centerViewInWindow();

        },

        centerViewInWindow: function()
        {
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();
            var qvHeight = this.$el.height();
            var qvWidth = this.$el.width();

            if (this.expanded)
            {
                var headerHeight = this.$(".QVHeader").outerHeight();
                this.$("#quickViewExpandedContent, .expandoLeftColumn, .expandoRightColumn").css("height", qvHeight - headerHeight + "px");
            } else
            {

                var left = windowWidth > qvWidth ? Math.round((windowWidth - qvWidth) / 2) : 10;

                var top = windowHeight > qvHeight ? Math.round((windowHeight - qvHeight) / 2) : 10;

                this.$el.css("left", left + "px");
                this.$el.css("top", top + "px");
            }

        },

        updateExpandButton: function()
        {
            if(this.model.get("detailData").hasSensorData())
            {
                this.$("#quickViewExpandDiv").removeClass("expandWaiting").removeClass("disabled");
                this.$("#expandIcon").removeClass("expandWaiting").removeClass("disabled");
            } else
            {
                this.$("#quickViewExpandDiv").addClass("disabled");
                this.$("#expandIcon").addClass("disabled");
            }
        },

        removeExpandWaiting: function()
        {
            this.$("#quickViewExpandDiv").removeClass("expandWaiting");
        },

        addExpandWaiting: function()
        {
            this.$("#quickViewExpandDiv").addClass("expandWaiting");
        }
    };
    return workoutQVExpand;
});