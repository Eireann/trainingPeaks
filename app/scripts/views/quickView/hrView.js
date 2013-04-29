define(
[
    "TP",
    "hbs!templates/views/quickView/heartRate/hrTabView",
    "hbs!templates/views/quickView/heartRate/hrZoneRow",
    "hbs!templates/views/quickView/heartRate/hrPeakRow"
],
function(TP, hrTabTemplate, hrZoneRowTemplate, hrPeakRowTemplate)
{
    return TP.ItemView.extend(
    {
        className: "quickViewHrTab",

        showThrobbers: false,

        template:
        {
            type: "handlebars",
            template: hrTabTemplate
        },

        ui:
        {
            "heartRateByZonesChart": "#heartRateByZonesChart",
            "heartRatePeaksChart": "#heartRatePeaksChart",
            "heartRateByZonesTable": "#heartRateByZonesTable",
            "heartRatePeaksTable": "#heartRatePeaksTable"
        },

        onRender: function()
        {
            this.renderTimeInZones();
            this.model.get("details").on("change:timeInHeartRateZones", this.renderTimeInZones, this);
        },

        renderTimeInZones: function()
        {
            var timeInZones = this.model.get("details").get("timeInHeartRateZones");
            if (timeInZones)
            {
                var zonesHtml = hrZoneRowTemplate(timeInZones);
                this.ui.heartRateByZonesTable.html(zonesHtml);
            } else
            {
                this.ui.heartRateByZonesTable.html("");
            }
        }
    });
});
