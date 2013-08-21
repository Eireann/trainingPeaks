define(
[
],
function()
{
    metricTypes =
    [
        {
            id: 1,
            label: "Blood Pressure",
            subMetrics:
            [
                { index: 0, label: "Systolic" },
                { index: 1, label: "Diastolic" }
            ]
        },
        {
            id: 2,
            label: "Percent Fat"
        },
        {
            id: 3,
            label: "Fatigue",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'None' },
                { value: 2, label: 'Very Low' },
                { value: 3, label: 'Low' },
                { value: 4, label: 'Average' },
                { value: 5, label: 'High' },
                { value: 6, label: 'Very High' },
                { value: 7, label: 'Extreme' }
            ]
        },
        {
            id: 4,
            label: "Overall Feeling",
            enumeration:
            [
                { value: 0, label: "Not Selected" },
                { value: 1, label: "Horrible" },
                { value: 2, label: "Extremely Poor" },
                { value: 3, label: "Poor" },
                { value: 4, label: "Bad" },
                { value: 5, label: "Below Average" },
                { value: 6, label: "Above Average" },
                { value: 7, label: "Good" },
                { value: 8, label: "Superior" },
                { value: 9, label: "Extremely Superior" },
                { value: 10, label: "Best" }
            ]
        },
        {
            id: 5,
            label: "Pulse"
        },
        {
            id: 6,
            label: "Sleep Hours"
        },
        {
            id: 7,
            label: "Soreness",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'None' },
                { value: 2, label: 'Extremely Low' },
                { value: 3, label: 'Very Low' },
                { value: 4, label: 'Low' },
                { value: 5, label: 'Moderately Low' },
                { value: 6, label: 'Moderate' },
                { value: 7, label: 'Moderately High' },
                { value: 8, label: 'High' },
                { value: 9, label: 'Very High' },
                { value: 10, label: 'Extreme' }
            ]
        },
        {
            id: 8,
            label: "Stress",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'None' },
                { value: 2, label: 'Very Low' },
                { value: 3, label: 'Low' },
                { value: 4, label: 'Average' },
                { value: 5, label: 'High' },
                { value: 6, label: 'Very High' },
                { value: 7, label: 'Extreme' }
            ]
        },
        {
            id: 9,
            label: "Weight in Kilograms"
        },
        {
            id: 10,
            label: "Sleep Quality",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Horrible' },
                { value: 2, label: 'Poor' },
                { value: 3, label: 'Bad' },
                { value: 4, label: 'Average' },
                { value: 5, label: 'Good' },
                { value: 6, label: 'Better' },
                { value: 7, label: 'Best' }
            ]
        },
        {
            id: 11,
            label: "Sleep Elevation in Meters"
        },
        {
            id: 12,
            label: "Note"
        },
        {
            id: 13,
            label: "Height in cm"
        },
        {
            id: 14,
            label: "BMI"
        },
        {
            id: 15,
            label: "RMR"
        },
        {
            id: 16,
            label: "BMR"
        },
        {
            id: 17,
            label: "Water Consumption"
        },
        {
            id: 18,
            label: "Menstruation",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'None' },
                { value: 2, label: 'Very Light' },
                { value: 3, label: 'Light' },
                { value: 4, label: 'Medium' },
                { value: 5, label: 'Heavy' },
                { value: 6, label: 'Very Heavy' },
                { value: 7, label: 'Extreme' }
            ]
        },
        {
            id: 19,
            label: "Urine Color",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Clear' },
                { value: 2, label: 'Light Yellow' },
                { value: 3, label: 'Medium Yellow' },
                { value: 4, label: 'Yellow' },
                { value: 5, label: 'Light Orange' },
                { value: 6, label: 'Medium Orange' },
                { value: 7, label: 'Orange' }
            ]
        },
        {
            id: 20,
            label: "Hydration Level",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Extremely Hydrated' },
                { value: 2, label: 'Very Hydrated' },
                { value: 3, label: 'Hydrated' },
                { value: 4, label: 'Normal' },
                { value: 5, label: 'Dehydrated' },
                { value: 6, label: 'Very Dehydrated' },
                { value: 7, label: 'Extremely Dehydrated' }
            ]
        },
        {
            id: 21,
            label: "Appetite",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Extremely hungry' },
                { value: 2, label: 'Very hungry' },
                { value: 3, label: 'Hungry' },
                { value: 4, label: 'Satisfied' },
                { value: 5, label: 'Full' },
                { value: 6, label: 'Very Full' },
                { value: 7, label: 'Extremely Full' }
            ]
        },
        {
            id: 22,
            label: "Motivation",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Extremely Unmotivated' },
                { value: 2, label: 'Very Unmotivated' },
                { value: 3, label: 'Unmotivated' },
                { value: 4, label: 'Uninspired' },
                { value: 5, label: 'Below Average' },
                { value: 6, label: 'Above Average' },
                { value: 7, label: 'Inspired' },
                { value: 8, label: 'Motivated' },
                { value: 9, label: 'Very Motivated' },
                { value: 10, label: 'Extremely Motivated' }
            ]
        },
        {
            id: 23,
            label: "Injury",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Extremely Injured' },
                { value: 2, label: 'Very Injured' },
                { value: 3, label: 'Injured' },
                { value: 4, label: 'Slightly Injured' },
                { value: 5, label: 'Below Average' },
                { value: 6, label: 'Above Average' },
                { value: 7, label: 'Well' },
                { value: 8, label: 'Healthy' },
                { value: 9, label: 'Very Healthy' },
                { value: 10, label: 'Extremely Healthy' }
            ] 
        },
        {
            id: 24,
            label: "Sickness",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Extremely sick' },
                { value: 2, label: 'Very sick' },
                { value: 3, label: 'Sick' },
                { value: 4, label: 'Slightly sick' },
                { value: 5, label: 'Healthy' },
                { value: 6, label: 'Very Healthy' },
                { value: 7, label: 'Extremely Healthy' }
            ]
        },
        {
            id: 25,
            label: "Shoulder Circumference"
        },
        {
            id: 26,
            label: "Chest Circumference"
        },
        {
            id: 27,
            label: "Waist Circumference"
        },
        {
            id: 28,
            label: "Abdomen Circumference"
        },
        {
            id: 29,
            label: "Hips Circumference"
        },
        {
            id: 30,
            label: "Bust Circumference"
        },
        {
            id: 31,
            label: "Left Wrist Circumference"
        },
        {
            id: 32,
            label: "Right Wrist Circumference"
        },
        {
            id: 33,
            label: "Left Bicep Circumference"
        },
        {
            id: 34,
            label: "Right Bicep Circumference"
        },
        {
            id: 35,
            label: "Left Forearm Circumference"
        },
        {
            id: 36,
            label: "Right Forearm Circumference"
        },
        {
            id: 37,
            label: "Left Thigh Circumference"
        },
        {
            id: 38,
            label: "Right Thigh Circumference"
        },
        {
            id: 39,
            label: "Left Calf Circumference"
        },
        {
            id: 40,
            label: "Right Calf Circumference"
        },
        {
            id: 41,
            label: "Neck Circumference"
        },
        {
            id: 42,
            label: "Glutes Circumference"
        },
        {
            id: 43,
            label: "Torso Circumference"
        },
        {
            id: 44,
            label: "Blood Glucose"
        },
        {
            id: 45,
            label: "Insulin",
            subMetrics:
            [
                { index: 0 }
            ]
        },
        {
            id: 46,
            label: "Time in Deep Sleep"
        },
        {
            id: 47,
            label: "Time in Rem Sleep"
        },
        {
            id: 48,
            label: "Time in Light Sleep"
        },
        {
            id: 49,
            label: "Number of Times Woken"
        },
        {
            id: 50,
            label: "Total Time Awake"
        },
        {
            id: 51,
            label: "Mood",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Worse than normal' },
                { value: 2, label: 'Normal' },
                { value: 3, label: 'Better than normal' }
            ]
        },
        {
            id: 52,
            label: "Yesterdays Training",
            enumeration: [
                { value: 0, label: 'Not Selected' },
                { value: 1, label: 'Worse than normal' },
                { value: 2, label: 'Normal' },
                { value: 3, label: 'Better than normal' },
                { value: 4, label: 'Rest day' }
            ]
        },
        {
            id: 53,
            label: "SPO2"
        },
        {
            id: 54,
            label: "Restwise Score",
            enumeration: [
                { value: 0, label: "0" },
                { value: 1, label: "10" },
                { value: 2, label: "20" },
                { value: 3, label: "30" },
                { value: 4, label: "40" },
                { value: 5, label: "50" },
                { value: 6, label: "60" },
                { value: 7, label: "70" },
                { value: 8, label: "80" },
                { value: 9, label: "90" },
                { value: 10, label: "100" }
            ]
        },
        {
            id: 55,
            label: "ZQScore"
        },
        {
            id: 56,
            label: "Water Percent"
        },
        {
            id: 57,
            label: "Muscle Mass"
        },
        {
            id: 58,
            label: "Steps"
        },
        {
            id: 59,
            label: "Skin Fold"
        }
    ];
    
    return metricTypes;
});

