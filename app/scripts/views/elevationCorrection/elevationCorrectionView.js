define(
[
    "TP",
    "utilities/charting/dataParser",
    "models/elevationCorrection",
    "models/commands/elevationCorrection",
    "utilities/charting/defaultFlotOptions",
    "utilities/conversion/convertToViewUnits",
    "hbs!templates/views/elevationCorrection/elevationCorrectionTemplate"
],
function (TP, DataParser, ElevationCorrectionModel, ElevationCorrectionCommandModel, getDefaultFlotOptions, convertToViewUnits, elevationCorrectionTemplate)
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
            
            _.bindAll(this, "showCorrectedElevation", "onElevationCorrectionApplied");

            this.dataParser = new DataParser();
            this.setOriginalElevation();

            this.$el.addClass("waiting");

            this.elevationCorrectionModel = new ElevationCorrectionModel({}, { latLngArray: this.dataParser.getLatLonArray() });
            this.elevationCorrectionModel.save().done(this.showCorrectedElevation);
        },

        setOriginalElevation: function()
        {
            this.dataParser.loadData(this.model.get("detailData").get("flatSamples"));
            this.originalElevation = this.dataParser.dataByChannel["Elevation"];
        },
        
        onRender: function()
        {
            this.ui.chart.css("height", "400px");
            this.renderPlot();
        },
        
        renderPlot: function()
        {
            var series = [];

            series.push(
            {
                color: "red",
                data: this.originalElevation,
                label: "Original",
                shadowSize: 0
            });

            if (this.correctedElevation)
            {
                series.push(
                {
                    color: "orange",
                    data: this.correctedElevation,
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
                    tickFormatter: function (value)
                    {
                        return value === 0 ? +0 : parseInt(convertToViewUnits(value, "elevation"), 10);
                    }
                }
            ];


            var onHoverHandler = function (flotItem, $tooltipEl) {
                $tooltipEl.html("");
            };

            var flotOptions = getDefaultFlotOptions(onHoverHandler);

            flotOptions.selection.mode = null;
            flotOptions.yaxes = yaxes;
            flotOptions.zoom = { enabled: false };
            flotOptions.filter = { enabled: false };

            this.plot = $.plot(this.ui.chart, series, flotOptions);
        },

        showCorrectedElevation: function()
        {
            this.$el.removeClass("waiting");
            
            this.correctedElevation = this.dataParser.createCorrectedElevationChannel(this.elevationCorrectionModel.get("elevations"));

            this.renderPlot();
        },
        
        onSubmitClicked: function()
        {
            var fileId = this.model.get("details").get("workoutDeviceFileInfos")[0].fileId;
            var elevationCorrectionCommand = new ElevationCorrectionCommandModel({}, { uploadedFileId: fileId });

            this.$el.addClass("waiting");
            elevationCorrectionCommand.execute().done(this.onElevationCorrectionApplied);
        },
        
        onElevationCorrectionApplied: function ()
        {
            var self = this;
            self.model.get("detailData").fetch().done(function()
            {
                self.setOriginalElevation();
                self.renderPlot();
                self.$el.removeClass("waiting");
            });
        },
        
        onResetClicked: function()
        {
            this.close();
        }
    });
});