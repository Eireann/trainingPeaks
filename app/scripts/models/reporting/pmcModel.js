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
            "atlStartValue",
            "startDate",
            "endDate"
        ],

        setDefaultParameters: function()
        {
            this.workoutTypeIds = [0];
            this.ctlConstant = 42;
            this.ctlStartValue = 0;
            this.atlConstant = 7;
            this.atlStartValue = 0;
            this.startDate = moment().subtract('days', 90);
            this.endDate = moment().add('days', 21);
        },

        buildUrlParameters: function()
        {
            if (!(this.startDate && this.endDate))
                throw "startDate & endDate needed for pmc";

            var start = moment(this.startDate).format(TP.utils.datetime.shortDateFormat);
            var end = moment(this.endDate).format(TP.utils.datetime.shortDateFormat);

            // 0 == all
            var workoutTypes = "0";
            
            if (this.workoutTypeIds.length !== _.keys(TP.utils.workout.types.typesById).length && this.workoutTypeIds.length !== 0)
            {
                workoutTypes = this.workoutTypeIds.join(",");
            }

            if (!workoutTypes)
            {
                workoutTypes = "0";
            }

            var urlExtension = "/" + start + "/" + end + "/" + workoutTypes + "/" + this.ctlConstant + "/" + this.ctlStartValue + "/" + this.atlConstant + "/" + this.atlStartValue;

            return urlExtension;
        }

    };

    PMCModel = _.extend({}, ReportingModelBase, PMCModel);
    return TP.Model.extend(PMCModel);
});