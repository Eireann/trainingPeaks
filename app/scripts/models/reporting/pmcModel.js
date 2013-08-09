define(
[
    "moment",
    "underscore",
    "TP",
    "./reportingModelBase"
],
function(moment, _, TP, ReportingModelBase)
{ 
    var PMCModel = {

        reportName: "performancedata",

        parameterNames: [
            "workoutTypeIds",
            "ctlConstant",
            "ctlStartValue",
            "atlConstant",
            "atlStartValue"
        ],

        setDefaultParameters: function()
        {
            this.requestParams.workoutTypeIds = [0];
            this.requestParams.ctlConstant = 42;
            this.requestParams.ctlStartValue = 0;
            this.requestParams.atlConstant = 7;
            this.requestParams.atlStartValue = 0;
            this.requestParams.startDate = moment().subtract('days', 90);
            this.requestParams.endDate = moment().add('days', 21);
        },

        buildUrlExtension: function()
        {
            if (!(this.requestParams.startDate && this.requestParams.endDate))
                throw "startDate & endDate needed for pmc";

            var start = moment(this.requestParams.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.requestParams.endDate).format(TP.utils.datetime.shortDateFormat);

            // 0 == all
            var workoutTypes = "0";
            
            if (this.requestParams.workoutTypeIds.length !== _.keys(TP.utils.workout.types.typesById).length && this.requestParams.workoutTypeIds.length !== 0)
            {
                workoutTypes = this.requestParams.workoutTypeIds.join(",");
            }

            if (!workoutTypes)
            {
                workoutTypes = "0";
            }

            var urlExtension = "/" + start + "/" + end + "/" + workoutTypes + "/" + this.requestParams.ctlConstant + "/" + 
                this.requestParams.ctlStartValue + "/" + this.requestParams.atlConstant + "/" + this.requestParams.atlStartValue;

            return urlExtension;
        }

    };

    PMCModel = _.extend({}, ReportingModelBase, PMCModel);
    return TP.Model.extend(PMCModel);
});