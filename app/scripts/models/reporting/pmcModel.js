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

        url: function ()
        {
            var url = this.urlRoot();
            url = url + "/" + this.buildDateUrlParams().join("/");
            return url;
        },

        // for data manager caching
        requestSignature: function ()
        {
            var url = this.url();
            var extensionParams = this.buildUrlExtensionParams();
            url = url + "/" + extensionParams.join("/");
            return url;
        },

        buildUrlExtensionParams: function()
        {
            var workoutTypes = this._buildWorkoutTypes().join(","); 

            return [
                workoutTypes,
                this.get("ctlConstant"),
                this.get("ctlStartValue"),
                this.get("atlConstant"),
                this.get("atlStartValue")
            ];
        },

        _buildWorkoutTypes: function()
        {
            // 0 == all
            var requestedWorkoutTypes = this.has("workoutTypeIds") ? this.get("workoutTypeIds") : [];
            requestedWorkoutTypes = _.filter(requestedWorkoutTypes, function(type)
            {
                return type.trim() !== "" && Number(type) !== 0;
            });

            if (requestedWorkoutTypes.length && requestedWorkoutTypes.length < _.keys(TP.utils.workout.types.typesById).length)
            {
                return _.map(requestedWorkoutTypes, function(typeId){return Number(typeId);});
            } else {
                return [0];
            }
        },

        fetch: function()
        {

            var options = {};

            var postData = {
                workoutTypes: this._buildWorkoutTypes(),
                ctlConstant: this.get("ctlConstant"),
                ctlStartValue: this.get("ctlStartValue"),
                atlConstant: this.get("atlConstant"),
                atlStartValue: this.get("atlStartValue")
            };

            options.contentType='application/json';
            options.data=JSON.stringify(postData);

            return this.save(null, options);
        }

    };

    PMCModel = _.extend({}, ReportingModelBase, PMCModel);
    return TP.Model.extend(PMCModel);
});