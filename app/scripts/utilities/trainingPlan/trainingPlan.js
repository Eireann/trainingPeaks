define(
[
    "underscore"
],
function(_)
{

    var planStatusById = {
        0: "Unknown",
        1: "Applied",
        2: "Available",
        3: "Purchased"
    };

    var planStatusByName = {
        Unknown: 0,
        Applied: 1,
        Available: 2,
        Purchased: 3
    };
    
    var startTypeEnum =
    {
        StartDate: 1,
        Event: 2,
        EndDate: 3,
        Live: 4
    };

    var trainingPlanUtils = {
        getNameByStatus: function(status)
        {
            status = Number(status);
            return planStatusById.hasOwnProperty(status) ? planStatusById[status] : planStatusById[0];
        },
        getStatusByName: function(name)
        {
            return planStatusByName.hasOwnProperty(name) ? planStatusByName[name] : planStatusByName["Unknown"];
        },
        startTypeEnum: startTypeEnum
    };

    return trainingPlanUtils;
});