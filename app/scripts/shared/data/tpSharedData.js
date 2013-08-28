define(
[
    "./accounting",
    "./athleteTypes",
    "./countriesAndStates",
    "./metricTypes"
],
function(
    accounting,
    athleteTypes,
    countriesAndStates,
    metricTypes
)
{

    return {

        accounting: accounting,
        athlete: {
            types: athleteTypes
        },
        countriesAndStates: countriesAndStates,
        metric: {
            types: metricTypes
        } 
    };

});

