define(
[
    "jqueryui/datepicker",
    "jquerySelectBox",
    "setImmediate",
    "TP",
    "models/commands/applyTrainingPlan",
    "hbs!templates/views/calendar/library/trainingPlanDetailsView"
],
function(
    datepicker,
    jquerySelectBox,
    setImmediate,
    TP,
    ApplyTrainingPlanCommand,
    trainingPlanDetailsViewTemplate
    )
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlanDetails",
        modal: true,

        template:
        {
            type: "handlebars",
            template: trainingPlanDetailsViewTemplate
        },

        events:
        {
            "click .apply": "onApply"    
        },

        initialize: function()
        {
            this.model.details.on("change", this.render, this);
            this.model.details.fetch();
        },

        onClose: function()
        {
            this.model.details.off("change", this.render, this);
        },

        onRender: function()
        {
            var self = this;
            setImmediate(function()
            {
                self.$(".datepicker").css("position", "relative").css("z-index", self.$el.css("z-index"));
                self.$(".datepicker").datepicker({ dateFormat: "yy-mm-dd", firstDay: theMarsApp.controllers.calendarController.startOfWeekDayIndex });
                self.$("select").selectBoxIt({ dynamicPositioning: false });
            });

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            data.applyable = data.planStatus === TP.utils.trainingPlan.getStatusByName("Purchased") || data.planStatus === TP.utils.trainingPlan.getStatusByName("Applied") ? true : false;
            data.applied = data.planStatus === TP.utils.trainingPlan.getStatusByName("Applied") ? true : false;
            data.applyDate = moment().format("YYYY-MM-DD");
            data.details = this.model.details.toJSON();
            return data;
        },

        onApply: function()
        {
            var command = new ApplyTrainingPlanCommand({
                planId: this.model.get("planId"),
                applyDateType: this.$("#applyDateType").val(),
                applyDate: this.$("#applyDate").val()
            });

            var self = this;
            command.execute().done(function()
            {
                self.model.fetch();
                self.model.details.fetch();

                // temporarily hide the overlay or it confuses the calendar header date detection on scroll
                self.$overlay.hide();
                var callback = function()
                {
                    self.$overlay.show();
                };

                self.model.trigger("requestRefresh", command.get("appliedPlan.startDate"), callback);
            });
        },

        alignArrowTo: function($element)
        {
            this.alignedTo = $element;
            this.left($element.offset().left + $element.width() + 15);
            var targetTop = $element.offset().top;
            this.top(targetTop);

            var windowHeight = $(window).height();
            if ((this.$el.offset().top + this.$el.height()) >= (windowHeight - 30))
            {
                this.top(windowHeight - this.$el.height() - 30);
                var myTop = this.$el.offset().top;
                var arrowTop = Math.round((targetTop - myTop) + 40);
                this.$(".arrow").css("top", arrowTop + "px");
            }
        }

    });
});