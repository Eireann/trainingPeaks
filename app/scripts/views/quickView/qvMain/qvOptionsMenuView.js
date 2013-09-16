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
            if (!this.model || !this.model.get("detailData"))
            {
                throw "QVOptionsMenuView requires a workout model with a detailData model";
            }
        },

        template:
        {
            type: "handlebars",
            template: optionsMenuTemplate
        },
        
        onRender: function()
        {
            this.enableOrDisableElevationCorrection();
            this.watchForLatLngChanges();
        },

        enableOrDisableElevationCorrection: function()
        {
            if (this.hasLatLngData())
                this.ui.elevationCorrectionLabel.removeClass("disabled");
            else
                this.ui.elevationCorrectionLabel.addClass("disabled");
        },
       
        hasLatLngData: function()
        {
            return this.model && this.model.get("detailData") &&
                this.model.get("detailData").get("flatSamples") &&
                this.model.get("detailData").get("flatSamples").hasLatLngData;
        },

        onElevationCorrectionClicked: function()
        {
            if (!(this.hasLatLngData()))
                return;
          
            var workoutModel = this.model;
            var openElevationCorrection = function()
            { 
                var view = new ElevationCorrectionView({ workoutModel: workoutModel });
                view.render();
            }

            theMarsApp.featureAuthorizer.runCallbackOrShowUpgradeMessage(
                theMarsApp.featureAuthorizer.features.ElevationCorrection,
                openElevationCorrection);

            this.close();
        },

        watchForLatLngChanges: function()
        {
            var detailData = this.model.get("detailData");
            detailData.on("change:flatSamples", this.enableOrDisableElevationCorrection, this);
            detailData.on("change:flatSamples.hasLatLngData", this.enableOrDisableElevationCorrection, this);
            this.on("close", function()
            {
                detailData.off("change:flatSamples", this.enableOrDisableElevationCorrection, this);
                detailData.off("change:flatSamples.hasLatLngData", this.enableOrDisableElevationCorrection, this);
            }, this);
        }
    });
});