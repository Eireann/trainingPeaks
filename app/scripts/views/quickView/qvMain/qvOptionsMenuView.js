define(
[
    "TP",
    "views/elevationCorrection/elevationCorrectionView",
    "hbs!templates/views/quickView/qvOptionsMenuTemplate"
],
function(TP, ElevationCorrectionView, optionsMenuTemplate)
{
    return TP.ItemView.extend(
    {
        modal: true,
        showThrobbers: false,
        tagName: "div",

        className: "workoutQuickViewMenu",

        events:
        {
            "click label": "onElevationCorrectionClicked"
        },

        initialize: function()
        {
        },

        template:
        {
            type: "handlebars",
            template: optionsMenuTemplate
        },
        
        onElevationCorrectionClicked: function()
        {
            var view = new ElevationCorrectionView({ model: this.model });
            view.render();
            this.close();
        }
    });
});