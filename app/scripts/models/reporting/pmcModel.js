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


        defaults: _.extend({}, ReportingModelBase.defaults, {
            workoutTypeIds: [0],
            ctlConstant: 42,
            ctlStartValue: 0,
            atlConstant: 7,
            atlStartValue: 0
        }),

        buildUrlExtensionParams: function()
        {

            // 0 == all
            var requestedWorkoutTypes = this.has("workoutTypeIds") ? this.get("workoutTypeIds") : [];
            requestedWorkoutTypes = _.filter(requestedWorkoutTypes, function(type)
            {
                return type.trim() !== "" && Number(type) !== 0;
            });

            if (requestedWorkoutTypes.length && requestedWorkoutTypes.length < _.keys(TP.utils.workout.types.typesById).length)
            {
                workoutTypes = requestedWorkoutTypes.join(",");
            } else {
                workoutTypes = "0";
            }

            return [
                workoutTypes,
                this.get("ctlConstant"),
                this.get("ctlStartValue"),
                this.get("atlConstant"),
                this.get("atlStartValue")
            ];
        }

    };

    PMCModel = _.extend({}, ReportingModelBase, PMCModel);
    return TP.Model.extend(PMCModel);
});