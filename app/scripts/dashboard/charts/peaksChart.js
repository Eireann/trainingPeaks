define(
[
    "underscore",
    "moment",
    "TP",
    "framework/chart",
    "utilities/charting/flotOptions",
    "utilities/charting/chartColors",
    "views/dashboard/chartUtils",
],
function(
   _,
   moment,
   TP,
   Chart,
   defaultFlotOptions,
   chartColors,
   DashboardChartUtils
)
{
   
   var PeaksChart = Chart.extend({

      subTypes:
      {
        8:  { requestType: 2, label: "Power", },
        28: { requestType: 1, label: "Heart Rate" },
        30: { requestType: 3, label: "Speed" },
        31: { requestType: 3, label: "Pace" },
        36: { requestType: 4, label: "Pace by Distance" }
      },

      initialize: function(attributes, options)
      {
         this.subType = this.subTypes[this.get("chartType")];
         this.set("title", TP.utils.translate("Peak " + this.subType.label));
      },

      fetchData: function()
      {
         var dateOptions = DashboardChartUtils.buildChartParameters(this.get("dateOptions"));
         var options = { workoutTypeIds: null, meanMaxBestsType: this.subType.requestType };

         var mainXhr = this.dataManager.fetchReport("meanmaxbests", dateOptions.startDate, dateOptions.endDate, options);

         // var dateComparisonOptions = DashboardChartUtils.buildChartParameters(this.get("dateComparisonOptions"));
         var comparisonXhr = this.dataManager.fetchReport("meanmaxbests", moment("2012-01-01"), moment("2014-01-01"), options);
         
         return $.when(mainXhr, comparisonXhr);
      },

      parseData: function(mainXhr, comparisonXhr)
      {
         var mainPeaks = this._parsePeaks(mainXhr[0]);
         var comparisonPeaks = this._parsePeaks(comparisonXhr[0]);

         var series =
         [{
            data: _.map(mainPeaks, function(peak, index) { return [index, peak.value || null]; }),
            color: "#000"
         },
         {
            data: _.map(comparisonPeaks, function(peak, index) { return [index, peak.value || null]; }),
            color: "#00f"
         }];

         return {
            dataSeries: series,
            flotOptions: defaultFlotOptions.getSplineOptions(null)
         };
      },

      _parsePeaks: function(data)
      {
         var peaks = _.map(data.meanMaxes, function(peak)
         {
            if (!peak || !_.isString(peak.label))
            {
               return; // Should this throw an error?
            }
            var match = peak.label.match(/^MM(\d+)(Second|Minute|Hour)s?$/i);
            var period = parseInt(match[1], 10);

            var unit = match[2].toLowerCase();
            if (unit === "second")
            {
               period *= 1;
            }
            else if (unit === "minute")
            {
               period *= 60;
            }
            else if (unit === "hour")
            {
               period *= 60 * 60;
            }
            else
            {
               throw new Error("Unknown mean-max/peak label " + unit);
            }

            return _.extend({ period: period }, peak);
         });

         return _.sortBy(peaks, "period");
      }
   });

   return PeaksChart;
});
