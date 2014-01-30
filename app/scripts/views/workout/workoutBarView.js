define(
[
    "jquery",
    "underscore",
    "moment",
    "TP",
    "views/quickView/qvMain/qvAttachmentUploadMenuView",
    "hbs!templates/views/workout/workoutBarView"
],
function (
    $,
    _,
    moment,
    TP,
    QVAttachmentUploadMenuView,
    workoutBarViewTemplate
    )
{


    return TP.ItemView.extend(
    {
        className: "workoutBarViewHeader workout",

        showThrobbers: false,

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
            this.model.on("change:description", this.setBreakthroughIconState, this);
            this.setBreakthroughIconState();
            this.updateAttachmentIconState();
            this.watchForFileAttachments();
        },
        
        turnOffRenderOnChange: function()
        {
            this.model.off("change", this.render);
        },
        
        updateHeaderClass: function ()
        {
            this.$el.attr("class", this.className);
            this.$el.addClass(this.getComplianceCssClassName());
            this.$el.addClass(this.getPastOrCompletedCssClassName());
            this.$el.addClass(this.getWorkoutTypeCssClassName());
        },
        
        getComplianceCssClassName: function ()
        {
            return TP.utils.workout.getComplianceCssClassName(this.model);
        },
        
        getWorkoutTypeCssClassName: function ()
        {
            return TP.utils.workout.types.getNameById(this.model.get("workoutTypeValueId")).replace(/ /g, "");
        },

        getPastOrCompletedCssClassName: function ()
        {
            var workout = this.model;
            if (TP.utils.datetime.isPast(workout.getCalendarDay()))
            {
                return "past";
            } else if (TP.utils.datetime.isToday(workout.getCalendarDay()) && TP.utils.workout.determineCompletedWorkout(workout.attributes))
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
            // if we haven't already fetched it
            var attachments = this.model.get("details").get("attachmentFileInfos");
            if (!attachments || !attachments.length)
            {
                this.model.get("details").fetch();
            }

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
                this.attachmentUploadMenu.setPosition({ fromElement: uploadButton, right: -12, top: -6 });
            }


            uploadButton.addClass("menuOpen");

            this.attachmentUploadMenu.render();
            this.attachmentUploadMenu.on("close", function() { uploadButton.removeClass("menuOpen"); });
        },

        setBreakthroughIconState: function()
        {
            var description = this.model.has("description") ? this.model.get("description") : "";

            if (description.indexOf("BT:") >= 0)
            {
                this.$("#breakThrough").addClass("active").removeClass("inactive");
            } else
            {
                this.$("#breakThrough").addClass("inactive").removeClass("active");
            }       
        }

    });
});
