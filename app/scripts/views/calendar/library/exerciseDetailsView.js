define(
[
    "jquery",
    "underscore",

    "TP",
    "views/userConfirmationView",
    "utilities/conversion/conversion",

    "hbs!templates/views/calendar/library/exerciseDetailsView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    $,
    _,

    TP,
    UserConfirmationView,
    conversion,

    exerciseDetailsViewTemplate,
    deleteConfirmationTemplate
    )
{
    return TP.ItemView.extend(
    {
        className: "workoutDetails",
        modal: true,
        dateFormat: "M/D/YYYY",

        template:
        {
            type: "handlebars",
            template: exerciseDetailsViewTemplate
        },

        events:
        {
            "click #closeIcon": "close",
            "click .delete": "confirmDelete",
            "click .edit": "handleEdit",
            "click .update": "handleUpdate",
            "change #pacePlannedField": "reCalculateSpeedOrPace",
            "change #velocityPlannedField": "reCalculateSpeedOrPace"
        },

        onRender: function()
        {
            var self = this;

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }
        },

        reCalculateSpeedOrPace: function(e)
        {
            var $changedField = this.$(e.currentTarget);
            var $pace = this.$("#pacePlannedField");
            var $speed = this.$("#velocityPlannedField");

            var options = { workoutTypeId: this.model.get("workoutTypeId") };
            if($changedField.attr("id") === $pace.attr("id"))
            {
                var parsedPace = conversion.parsePace($changedField.val().trim(), options);
                if(_.isFinite(parsedPace))
                {
                    var formattedSpeed = conversion.formatSpeed(parsedPace, options);
                    $speed.val(formattedSpeed);
                }
            }
            else
            {
                var parsedSpeed = conversion.parseSpeed($speed.val().trim(), options);
                if(_.isFinite(parsedSpeed) && parsedSpeed)
                {
                    var formattedPace = conversion.formatPace(parsedSpeed, options);
                    $pace.val(formattedPace);
                }
            }

        },

        handleEdit: function(e)
        {
            e.preventDefault();
            this.$(".edit").hide();
            this.$(".update").show();
            this.$("input").removeAttr("readonly");
        },

        handleUpdate: function(e)
        {
            e.preventDefault();
            var updateWorkout = this.model;

            var self = this;
            var new_attrs = {};
            self.waitingOn();
            updateWorkout.save(new_attrs, {wait: true}).done(function()
            {
                self.close();
            }).fail(function()
            {
                // TODO: how should this be handled?
                // var errorMessageView = new UserConfirmationView({ template: errorMessage });
                // errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        confirmDelete: function(e)
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.listenToOnce(this.deleteConfirmationView, "userConfirmed", this.deleteWorkout);
        },

        deleteWorkout: function(options)
        {
            var deleteWorkout = this.model;

            var self = this;
            self.waitingOn();
            deleteWorkout.destroy({wait: true}).done(function()
            {
                self.close();
            }).fail(function()
            {
                // TODO: same as above
                // var errorMessageView = new UserConfirmationView({ template: errorMessage });
                // errorMessageView.render();
            }).always(function()
            {
                self.waitingOff();
            });
        },

        alignArrowTo: function($element)
        {
            // align the top and left of this popup to the target library item
            this.alignedTo = $element;
            this.left($element.offset().left + $element.width() + 16);
            var targetTop = $element.offset().top;
            this.top(targetTop);

            // offset the arrow to line up with middle of target element
            var arrowOffset = Math.round($element.height() / 2) + 8;
            var arrowTop = arrowOffset;

            // if we're too close to the bottom, move the window up
            var windowHeight = $(window).height();
            if ((this.$el.offset().top + this.$el.height()) >= (windowHeight - 30))
            {
                this.top(windowHeight - this.$el.height() - 30);
                var myTop = this.$el.offset().top;
                arrowTop = Math.round((targetTop - myTop) + arrowOffset);
            }

            if(arrowTop > this.$el.height() - 10)
            {
                arrowTop = this.$el.height() - 10;
            }

            this.$(".arrow").css("top", arrowTop + "px");
        }
    });
});
