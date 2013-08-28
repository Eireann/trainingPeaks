define(
[
    "framework/utilities"
],
function(
    utils
)
{

    var athleteTypes = [
        {label: utils.translate("Adventure Racer"), data: 8},
        {label: utils.translate("Climber"), data:9},
        {label: utils.translate("Cyclist"), data:6},
        {label: utils.translate("Runner"), data:2},
        {label: utils.translate("Swimmer"), data:1},
        {label: utils.translate("Triathlete"), data:4},
        {label: utils.translate("Mtb"), data:7},
        {label: utils.translate("Duathlete"), data:3},
        {label: utils.translate("Other"), data:5},
        {label: utils.translate("Undefined"), data:0}
    ]; 
    
    return athleteTypes;
});

