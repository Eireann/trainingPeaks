﻿define(
[
    "underscore",
    "TP",
    "views/quickView/qvMain/qvAttachmentUploadMenuView",
    "hbs!templates/views/workout/workoutBarView"
],
function (
    _,
    TP,
    QVAttachmentUploadMenuView,
    workoutBarViewTemplate
    )
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
            template: workoutBarViewTemplate
        },

        events:
        {
            "click .addAttachment": "onAddAttachmentClicked"
        },

        onRender: function()
        {
            this.updateHeaderClass();
            this.model.on("change", this.updateHeaderClassOnChange, this);
            this.updateAttachmentIconState();
            this.watchForFileAttachments();
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
        },

        watchForFileAttachments: function()
        {
            this.model.get("details").on("change:attachmentFileInfos", this.updateAttachmentIconState, this);
            this.on("close", this.stopWatchingForFileAttachments, this);
        },

        stopWatchingForFileAttachments: function()
        {
            this.model.get("details").off("change:attachmentFileInfos", this.updateAttachmentIconState, this);
        },

        updateAttachmentIconState: function()
        {
            var attachments = this.model.get("details").get("attachmentFileInfos");
            if (attachments && attachments.length)
            {
                this.$(".addAttachment").addClass("withAttachments");
            } else
            {
                this.$(".addAttachment").removeClass("withAttachments");
            }
        },

        onAddAttachmentClicked: function()
        {
            _.bindAll(this, "displayAttachmentView");
            var displayAttachmentPromise = new $.Deferred();
            displayAttachmentPromise.done(this.displayAttachmentView);
            this.trigger("before:displayAttachmentView", displayAttachmentPromise);
            displayAttachmentPromise.resolve();           
        },

        displayAttachmentView: function()
        {
            // Wire up & Display the File Attachment Tomahawk
            var uploadButton = this.$("div.addAttachment");
            var offset = uploadButton.offset();
            var direction = this.expanded ? "right" : "left";

            this.attachmentUploadMenu = new QVAttachmentUploadMenuView({ model: this.model, direction: direction });

            if (direction === "right")
            {
                this.attachmentUploadMenu.setPosition({ fromElement: uploadButton, left: uploadButton.outerWidth() + 13, top: -8 });
            } else
            {
                this.attachmentUploadMenu.setPosition({ fromElement: uploadButton, right: -13, top: -8 });
            }


            uploadButton.addClass("menuOpen");

            this.attachmentUploadMenu.render();
            this.attachmentUploadMenu.on("close", function () { uploadButton.removeClass("menuOpen"); });
        }


    });
});