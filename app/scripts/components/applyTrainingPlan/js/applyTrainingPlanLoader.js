/* jshint ignore:start */
var applyReady = new $.Deferred();

/*
options:
trainingPlanId
target
onSuccess
*/

function LoadApplyTrainingPlan(options)
{
    applyReady.done(function(ApplyTrainingPlan)
    {
        var applyPlan = new ApplyTrainingPlan(options);

        applyPlan.load().done(function(){
          $(options.target).append(applyPlan.render().$el);
        });
    });
}

requirejs([
    "wrappedMoment"
], function(wrappedMoment)
{
    requirejs(
    [
      "jquery",
      "components/applyTrainingPlan/js/applyTrainingPlan"
    ],
    function(
      $,
      ApplyTrainingPlan
    )
    {
        applyReady.resolve(ApplyTrainingPlan);
    });
});

// some jquery components call define with only one arg, which breaks in almond
almondDefine = define;
define = function(name, deps, callback)
{
    if(typeof deps === 'undefined')
    {
        deps = [];
    }
    return almondDefine(name, deps, callback);
}
/* jshint ignore:end */