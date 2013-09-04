define(
[
    "TP",
    "moment",
    "hbs!templates/views/calendar/library/applyTrainingPlanToCalendarConfirmation"
],
function(TP, moment, applyTrainingPlanTemplate)
{
    return TP.ItemView.extend(
    {
        initialize: function(options)
        {
            if (!(options.model && options.targetDate))
            {
                throw "A model and targetDate are required";
            }
            this.model = options.model;
            this.targetDate = options.targetDate;
            this.startOrEndRangeValue = 1;
            this.detailDataPromise = this.model.details.fetch();
            this.detailDataPromise.done(this.render);
        },

        onRender: function ()
        {

        },

        applyPlan: function()
        {
            this.$el.addClass('waiting');
            var apply = this.model.applyToDate(this.eligibleTargetDate.format("MM-DD-YYYY"), this.startOrEndRangeValue);
            var self = this;
            apply.done(function()
            {
                self.close();
            });
        },

        _setEligibleTargetDate: function()
        {
            var targetDateIndex = moment(this.targetDate).day(),
                requiredDateIndex;

            if (this.startOrEndRangeValue === 1)
            {
                this._setEligibleTargetDateFromStartDate();
            }
            else {
                this._setEligibleTargetDateFromEndDate();
            }
        },

        _setEligibleTargetDateFromStartDate: function()
        {
            // start date chosen
            var targetDateIndex = moment(this.targetDate).day(),
                requiredDateIndex = moment(this.model.details.get("startDate")).day();

            if (targetDateIndex !== requiredDateIndex)
            {
                if (requiredDateIndex > targetDateIndex)
                {
                    this.eligibleTargetDate = moment(this.targetDate).day(requiredDateIndex);
                } else {
                    this.eligibleTargetDate = moment(this.targetDate).add("days", 7 - requiredDateIndex);
                }
            }
            else {
                this.eligibleTargetDate = this.targetDate;
            }
        },

        _setEligibleTargetDateFromEndDate: function()
        {
            var targetDateIndex = moment(this.targetDate).day(),
                requiredDateIndex = moment(this.model.details.get("endDate")).day(),
                endDate;


            if (requiredDateIndex > targetDateIndex)
            {
                endDate = moment(this.targetDate).day(requiredDateIndex); 
            } else if (requiredDateIndex < targetDateIndex)
            {
                endDate = moment(this.targetDate).day(requiredDateIndex); 
            } else if (requiredDateIndex === targetDateIndex)
            {
                endDate = moment(this.targetDate);
            }

            this.eligibleTargetDate = endDate;
        },

        serializeData: function()
        {
            if (this.detailDataPromise.state() === "pending")
            {
                return {
                    eligibleTargetDate: this.targetDate
                };
            }
            var date;
            this._setEligibleTargetDate();
            if (this.eligibleTargetDate === this.targetDate)
            {
                date = null;
            } else {
                date  = this.eligibleTargetDate.format("MM-DD-YYYY");
            }
            return {
                eligibleTargetDate: date,
                endRangeSelected: this.startOrEndRangeValue === 3
            };
        },

        modal:
        {
            mask: true,
            shadow: true
        },

        closeOnResize: false,

        showThrobbers: false,
        tagName: "div",
        className: "applyTrainingPlanToCalendarConfirmation",

        events:
        {
            'change select': 'updateStartOrEndRangeValue',
            'click #confirmationOk': 'applyPlan'
        },

        updateStartOrEndRangeValue: function(e)
        {
            this.startOrEndRangeValue = parseInt($(e.target).val(), 10);
            this.render();
        },

        template:
        {
            type: "handlebars",
            template: applyTrainingPlanTemplate
        }
    });
});
