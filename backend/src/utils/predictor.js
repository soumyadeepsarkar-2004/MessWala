/**
 * Simple Linear Regression for cost prediction.
 * Takes an array of values (y-values), uses index as x.
 * Returns the predicted next value.
 */
function linearRegression(data) {
    const n = data.length;
    if (n === 0) return 0;
    if (n === 1) return data[0];

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += data[i];
        sumXY += i * data[i];
        sumX2 += i * i;
    }

    const denominator = n * sumX2 - sumX * sumX;

    if (denominator === 0) {
        return sumY / n; // All x values are the same, return mean
    }

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    // Predict for the next index
    return slope * n + intercept;
}

module.exports = { linearRegression };
