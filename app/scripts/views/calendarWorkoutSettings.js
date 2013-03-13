define(
[
    "TP",
    "setImmediate",
    "jqueryOutside",
    "views/deleteConfirmationView",
    "hbs!templates/views/calendarWorkoutSettingsHover"
],
function (TP, setImmediate, jqueryOutside, DeleteConfirmationView, calendarWorkoutSettingsHover)
{
    return TP.ItemView.extend(
    {

        showThrobbers: false,
        tagName: "div",
       

        className: "workoutSettingsHover",

        events:
        {
            "click #workoutSettingsLabelDelete": "onDelete",
            "click #workoutSettingsLabelCopy": "onCopyClicked",
            "click #workoutSettingsLabelCut": "onCutClicked"
        },

        onCopyClicked: function()
        {
            this.model.trigger("workout:copy", this.model);
            this.close();
        },
        
        onCutClicked: function()
        {
            this.model.trigger("workout:cut", this.model);
            this.close();
        },

        hideWorkoutSettings: function (e)
        {
            this.close();
            this.trigger("mouseleave", e);
            //delete this;
        },

        initialize: function(options)
        {
            this.posX = options.left;
            this.posY = options.top;
            this.parentEl = options.parentEl;
            this.inheritedClassNames = options.className;
        },

        attributes: function()
        {
            return {
                "id": "workoutSettingsDiv",
                "data-workoutId": this.model.id
            };
        },

        template:
        {
            type: "handlebars",
            template: calendarWorkoutSettingsHover
        },

        onRender: function()
        {
            $('body').append(this.$el);
            this.$el.dialog({
                modal: true,
                position:
                {
                    my: "center bottom",
                    at: "center bottom",
                    of: ".workoutSettings"
                }
            });
            _.bindAll(this, "hideWorkoutSettings");
            var theView = this;
            setImmediate(function() { theView.$el.bind("clickoutside", theView.hideWorkoutSettings); });
            //this.$el.attr("class", this.$el.attr("class") + " " + this.inheritedClassNames);
            this.$el.css("left", this.posX - Math.round(this.$el.width() / 2)).css("top", this.posY - this.$el.height());
        },

        onDelete: function()
        {
            this.close();
            
            this.deleteConfirmationView = new DeleteConfirmationView();
            this.deleteConfirmationView.render();
            var self = this;
            this.deleteConfirmationView.on("deleteConfirmed", function () { self.model.destroy({ wait: true }); });
        }
    });
});