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
            this.model.details.fetch().done();
        },

        onRender: function ()
        {

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
                endDate = moment(this.targetDate).add("days", 7 - requiredDateIndex);
            } else if (requiredDateIndex === targetDateIndex)
            {
                endDate = moment(this.targetDate);
            }
            
            // while the training plan overlaps past days (due to its end date location)
            // move the end date out one week
            while(moment.duration(endDate - moment()).days() < this.model.details.get("dayCount"))
            {
                endDate = endDate.add("weeks", 1);
            }

            this.eligibleTargetDate = endDate.subtract("days", this.model.details.get("dayCount"));
        },

        serializeData: function()
        {
            var date;
            this._setEligibleTargetDate();
            if (this.eligibleTargetDate === this.targetDate)
            {
                date = null;
            } else {
                date  = this.eligibleTargetDate.format("MM-DD-YYYY");
            }
            return {
                eligibleTargetDate: date
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

        },

        template:
        {
            type: "handlebars",
            template: applyTrainingPlanTemplate
        }
    });
});
