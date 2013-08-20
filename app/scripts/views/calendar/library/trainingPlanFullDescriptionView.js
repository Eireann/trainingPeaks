define(
[
    "underscore",
    "TP",
    "hbs!Templates/views/calendar/library/trainingPlanFullDescriptionView"
],
function(
    _,
    TP,
    trainingPlanFullDescriptionTemplate
    )
{
    return TP.ItemView.extend(
    {

        tagName: "div",
        className: "trainingPlanFullDescriptionView",
        modal: true,

        template:
        {
            type: "handlebars",
            template: trainingPlanFullDescriptionTemplate
        },

        events:
        {
            "click #closeIcon": "close"
        },
        
        onRender: function()
        {
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            $(".fullDescription").css("width", windowWidth - 655);
            $(".fullDescription").css("top", (windowHeight - this.$(".fullDescription").height())/2);
        },

        onClose: function()
        {
            this.model.details.off("change", this.render, this);
        },

        serializeData: function()
        {
            var data = this.model.toJSON();
            // data.applyable = this.model.details.has("title") && _.contains([null, 
            //     TP.utils.trainingPlan.getStatusByName("Purchased"),
            //     TP.utils.trainingPlan.getStatusByName("Applied")], 
            //     data.planStatus);
            data.applyable = this.model.details.has("title");

            
            data.details = this.model.details.toJSON();
            data.details.weekcount = Math.ceil(data.details.dayCount / 7);

            

            data.details.descriptionText = $("<div>").html(data.details.description).text();

            return data;
        },

        rePositionView: function ()
        {
            return
        }
    });
});