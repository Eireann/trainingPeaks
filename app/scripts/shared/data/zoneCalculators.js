define(
[
],
function()
{

    var heartRateZoneCalculatorTypes = {
        LactateThreshold: 1,
        MaximumHeartRate: 2,
        MaxAndRestingHeartRate: 3,
        LTAndMaxHeartRate: 4
    };

    var heartRateZoneCalculators = {
        FrielZone: {
            id: 1,
            label: "Joe Friel",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        FrielRunZone: {
            id: 2,
            label: "Joe Friel for Running",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        FrielBikeZone: {
            id: 3,
            label: "Joe Friel for Cycling",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        CogganZone: {
            id: 4,
            label: "Andy Coggan",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        CycleSmartZone: {
            id: 5,
            label: "CycleSmart",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        USACZone: {
            id: 6,
            label: "USAC",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        },
        BCFZone: {
            id: 7,
            label: "BCF/ABCC/WCPP Revised",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        EdwardsZone: {
            id: 8,
            label: "Sally Edwards",
            numberOfZones: 5,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        TimexZone: {
            id: 9,
            label: "",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        KeenZone: {
            id: 10,
            label: "Peter Keen",
            numberOfZones: 4,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        SternZone: {
            id: 11,
            label: "Ric Stern",
            numberOfZones: 7,
            type: heartRateZoneCalculatorTypes.MaximumHeartRate
        },
        KarvonenZone: {
            id: 12,
            label: ""
        },
        ACSMZone: {
            id: 13,
            label: ""
        },
        TimexManualZone: {
            id: 14,
            label: ""
        },
        CTSZone: {
            id: 17,
            label: ""
        },
        CTSRunZone: {
            id: 18,
            label: ""
        },
        DurataZone: {
            id: 19,
            label: "Durata Training",
            numberOfZones: 10,
            type: heartRateZoneCalculatorTypes.LactateThreshold
        }
    };

    return {
        heartRate: heartRateZoneCalculators
    };

});

