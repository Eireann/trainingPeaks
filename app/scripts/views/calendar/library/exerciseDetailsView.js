define(
[
    "underscore",

    "TP",
    "framework/notYetImplemented",
    "views/userConfirmationView",

    "hbs!templates/views/calendar/library/exerciseDetailsView",
    "hbs!templates/views/confirmationViews/deleteConfirmationView"
],
function(
    _,

    TP,
    notYetImplemented,
    UserConfirmationView,

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
            "click .edit": notYetImplemented,
            "click .delete": "confirmDelete"
        },

        onRender: function()
        {
            var self = this;

            if(this.alignedTo)
            {
                this.alignArrowTo(this.alignedTo);
            }
        },

        confirmDelete: function(e)
        {
            this.deleteConfirmationView = new UserConfirmationView({ template: deleteConfirmationTemplate });
            this.deleteConfirmationView.render();
            this.deleteConfirmationView.on("userConfirmed", this.deleteWorkout, this);
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
                var errorMessageView = new UserConfirmationView();
                errorMessageView.render();
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