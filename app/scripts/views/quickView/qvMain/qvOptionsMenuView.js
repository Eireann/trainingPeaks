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

        ui:
        {
            "elevationCorrectionLabel": "label#elevationCorrectionLabel"
        },

        initialize: function()
        {
        },

        template:
        {
            type: "handlebars",
            template: optionsMenuTemplate
        },
        
        onRender: function()
        {
            if (this.model.get("detailData") && this.model.get("detailData").get("flatSamples") && this.model.get("detailData").get("flatSamples").hasLatLngData)
                this.ui.elevationCorrectionLabel.removeClass("disabled");
            else
                this.ui.elevationCorrectionLabel.addClass("disabled");
        },
        
        onElevationCorrectionClicked: function()
        {
            if (!(this.model.get("detailData") && this.model.get("detailData").get("flatSamples") && this.model.get("detailData").get("flatSamples").hasLatLngData))
                return;
            
            var view = new ElevationCorrectionView({ model: this.model });
            view.render();
            this.close();
        }
    });
});