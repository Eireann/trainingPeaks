define(
[
    "jquery",
    "underscore",

    "TP",
    "views/userConfirmationView",
    "shared/utilities/formUtility",
    "utilities/conversion/conversion",

    "hbs!templates/views/calendar/library/exerciseDetailsView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    $,
    _,

    TP,
    UserConfirmationView,
    FormUtility,
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

        modelEvents: {},

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
            var options = { workoutTypeId: this.model.get("workoutTypeId") };

            FormUtility.bindFormToModel(this.$el, this.model, options);
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
                var formattedSpeed;
                var parsedPace = conversion.parsePace($changedField.val().trim(), options);

                formattedSpeed = _.isFinite(parsedPace) ? conversion.formatSpeed(parsedPace, options) : "";
                $speed.val(formattedSpeed);
            }
            else
            {
                var formattedPace;
                var parsedSpeed = conversion.parseSpeed($speed.val().trim(), options);

                formattedPace = (_.isFinite(parsedSpeed) && parsedSpeed) ? conversion.formatPace(parsedSpeed, options) : "";
                $pace.val(formattedPace);
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

            var self = this;

            self.waitingOn();
            this.model.save().done(function()
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
