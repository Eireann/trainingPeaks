define(
[
    "TP",
    "utilities/charting/dataParser",
    "models/elevationCorrection",
    "utilities/charting/defaultFlotOptions",
    "utilities/conversion/convertToViewUnits",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function(TP, DataParser, ElevationCorrectionModel, getDefaultFlotOptions, convertToViewUnits, elevationCorrectionTemplate)
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
            "chart": "div.elevationGraph"
        },

        initialize: function ()
        {
            if (!this.model || !this.model.get("detailData") || !this.model.get("detailData").get("flatSamples") || !this.model.get("detailData").get("flatSamples").hasLatLngData || !_.contains(this.model.get("detailData").get("flatSamples").channelMask, "Elevation"))
                throw "ElevationCorrectionView requires a DetailData Model with valid flatSamples, latLngData, and Elevation channel";
            
            this.dataParser = new DataParser();
            this.dataParser.loadData(this.model.get("detailData").get("flatSamples"));

            _.bindAll(this, "showCorrectedElevation");
        },
        
        onRender: function()
        {
            this.ui.chart.css("height", "400px");
            var originalElevation = this.dataParser.dataByChannel["Elevation"];
            this.renderPlot(originalElevation);
        },

        renderPlot: function(originalElevation, correctedElevation)
        {
            var series = [];

            series.push(
            {
                color: "red",
                data: originalElevation,
                label: "Original",
                shadowSize: 0
            });

            if (correctedElevation)
            {
                series.push(
                {
                    color: "orange",
                    data: correctedElevation,
                    label: "Corrected",
                    shadowSize: 0
                });
            }

            var yaxes =
            [
                {
                    show: true,
                    label: "Elevation",
                    position: "left",
                    color: "red",
                    tickColor: "red",
                    font:
                    {
                        color: "red"
                    },
                    tickFormatter: function(value)
                    {
                        return value === 0 ? +0 : parseInt(convertToViewUnits(value, "elevation"), 10);
                    }
                }
            ];


            var onHoverHandler = function (flotItem, $tooltipEl)
            {
                $tooltipEl.html("");
            };
            
            var flotOptions = getDefaultFlotOptions(onHoverHandler);

            flotOptions.selection.mode = null;
            flotOptions.yaxes = yaxes;
            flotOptions.zoom = { enabled: false };
            flotOptions.filter = { enabled: false };

            this.plot = $.plot(this.ui.chart, series, this.flotOptions);

            this.$el.addClass("waiting");
            
            this.elevationCorrectionModel = new ElevationCorrectionModel({}, { latLngArray: this.dataParser.getLatLonArray() });
            this.elevationCorrectionModel.save().done(this.showCorrectedElevation);
        },
        
        showCorrectedElevation: function()
        {
            this.$el.removeClass("waiting");
            
            var originalElevation = this.dataParser.dataByChannel["Elevation"];
            var correctedElevation = this.dataParser.createCorrectedElevationChannel(this.elevationCorrectionModel.get("elevations"));

            this.renderPlot(originalElevation, correctedElevation);
        },
        
        onResetClicked: function()
        {
            this.close();
        }
    });
});