define(
[
    "TP",
    "utilities/charting/dataParser",
    "models/elevationCorrection",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function(TP, DataParser, ElevationCorrectionModel, elevationCorrectionTemplate)
{
    return TP.ItemView.extend(
    {
        modal:
        {
            mask: true,
            shadow: true
        },

        className: "",

        events:
        {
            "click button[type=submit]": "onSubmitClicked",
            "click button[type=reset]": "onResetClicked"
        },

        template:
        {
            type: "handlebars",
            template: elevationCorrectionTemplate
        },

        ui:
        {
        },

        initialize: function ()
        {
        },
        
        onSubmitClicked: function()
        {
            if (!this.model || !this.model.get("detailData") || !this.model.get("detailData").get("flatSamples") || !this.model.get("detailData").get("flatSamples").hasLatLngData)
                return;

            var dataParser = new DataParser();
            dataParser.loadData(this.model.get("detailData").get("flatSamples"));

            var model = new ElevationCorrectionModel({}, { latLngArray: dataParser.getLatLonArray() });
            model.save().done(function()
            {
                console.log(model.get("elevations"));
            });
        },
        
        onResetClicked: function()
        {
            this.close();
        }
    });
});