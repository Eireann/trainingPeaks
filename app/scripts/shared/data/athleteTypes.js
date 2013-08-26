define(
[
    "TP"
],
function(
    TP
)
{

    var athleteTypes = [
        {label: TP.utils.translate("Adventure Racer"), data: 8},
        {label: TP.utils.translate("Climber"), data:9},
        {label: TP.utils.translate("Cyclist"), data:6},
        {label: TP.utils.translate("Runner"), data:2},
        {label: TP.utils.translate("Swimmer"), data:1},
        {label: TP.utils.translate("Triathlete"), data:4},
        {label: TP.utils.translate("Mtb"), data:7},
        {label: TP.utils.translate("Duathlete"), data:3},
        {label: TP.utils.translate("Other"), data:5},
        {label: TP.utils.translate("Undefined"), data:0}
    ]; 
    
    return athleteTypes;
});

