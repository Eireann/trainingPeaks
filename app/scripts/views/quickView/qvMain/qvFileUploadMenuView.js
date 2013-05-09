define(
[
    "TP",
    "hbs!templates/views/quickView/workoutFileUploadMenu"
],
function(TP, WorkoutFileUploadMenuTemplate)
{
    return TP.ItemView.extend(
    {

        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "workoutFileUploadMenu",

        events:
        {
            "click #workoutFileUploadMenuBrowse": "onBrowseClicked",
            "click #closeIcon": "close"
        },

        attributes: {
            "id": "workoutFileUploadMenuDiv"
        },

        template:
        {
            type: "handlebars",
            template: WorkoutFileUploadMenuTemplate
        },

        onBrowseClicked: function()
        {
            this.trigger("browseFile");
        },

        initialize: function(options)
        {
            this.$el.addClass(options.direction);
        }
    });
});