define(
[
    "moment",
    "underscore",
    "TP",
    "./reportingModelBase"
],
function(moment, _, TP, ReportingModelBase)
{ 
    var FitnessSummaryModel = {

        reportName: "fitness",
    };

    FitnessSummaryModel = _.extend({}, ReportingModelBase, FitnessSummaryModel);
    return TP.Model.extend(FitnessSummaryModel);
});