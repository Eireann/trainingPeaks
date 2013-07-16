define(
[
    "underscore",
    "TP",
    "hbs!templates/views/workout/workoutBarView"
],
function (_, TP, workoutBarview)
{

    /*
    TODO:
    file attachments
    route icon placeholder
    review
    */

    return TP.ItemView.extend(
    {
        template:
        {
            type: "handlebars",
            template: workoutBarview
        },

        onRender: function()
        {
            this.updateHeaderClass();
            this.model.on("change", this.updateHeaderClassOnChange, this);
        },
        
        today: moment().format(TP.utils.datetime.shortDateFormat),

        turnOffRenderOnChange: function()
        {
            this.model.off("change", this.render);
        },
        
        updateHeaderClass: function ()
        {
            // first calculate it, then reset if needed
            var tmpElement = $("<div></div>").addClass("workoutBarViewHeader").addClass("workout");
            tmpElement.addClass(this.getComplianceCssClassName());
            tmpElement.addClass(this.getPastOrCompletedCssClassName());

            var header = this.$(".workoutBarViewHeader");
            if (header.attr("class") !== tmpElement.attr("class"))
            {
                header.attr("class", tmpElement.attr("class"));
            }
            this.$(".workoutBarViewHeader").addClass(this.getComplianceCssClassName());
            this.$(".workoutBarViewHeader").addClass(this.getPastOrCompletedCssClassName());
            this.$(".workoutBarViewHeader").addClass(this.getWorkoutTypeCssClassName());


        },
        
        getComplianceCssClassName: function ()
        {
            var complianceAttributeNames =
            {
                totalTime: "totalTimePlanned"
            };
            /*
                distance: "distancePlanned",
                tssActual: "tssPlanned"
            */
            var workout = this.model;

            for (var key in complianceAttributeNames)
            {

                var plannedValueAttributeName = complianceAttributeNames[key];
                var completedValueAttributeName = key;
                var plannedValue = this.model.get(plannedValueAttributeName) ? this.model.get(plannedValueAttributeName) : 0;
                var completedValue = this.model.get(completedValueAttributeName) ? this.model.get(completedValueAttributeName) : 0;

                if (plannedValue)
                {
                    if ((plannedValue * 0.8) <= completedValue && completedValue <= (plannedValue * 1.2))
                    {
                        return "ComplianceGreen";
                    }
                    else if ((plannedValue * 0.5) <= completedValue && completedValue <= (plannedValue * 1.5))
                    {
                        return "ComplianceYellow";
                    }
                    else
                    {
                        return "ComplianceRed";
                    }
                }
            }


            // if nothing was planned, we can't fail to complete it properly ...

            return "ComplianceNone";
        },
        
        getWorkoutTypeCssClassName: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")).replace(/ /g, "");
        },

        getPastOrCompletedCssClassName: function ()
        {
            if (this.model.getCalendarDay() < this.today)
            {
                return "past";
            } else if (this.model.getCalendarDay() === this.today && TP.utils.workout.determineCompletedWorkout(this.model.attributes))
            {
                return "past";
            } else
            {
                return "future";
            }
        },

        removeUpdateHeaderOnChange: function()
        {
            this.model.off("change", this.updateHeaderClassOnChange);
        },

        updateHeaderClassOnChange: function()
        {
            this.updateHeaderClass();
        }
    });
});