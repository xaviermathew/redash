import { isObject, isNumber } from "lodash";

function calculateAxisRange(range, min, max) {
  return [isNumber(min) ? min : range[0], isNumber(max) ? max : range[1]];
}

function calculateAbsoluteDiff(value, totalRange, percentageDiff) {
  return (percentageDiff * totalRange) / (1 - Math.abs(value) / totalRange - percentageDiff);
}

function alignYAxesAtZero(axisA, axisB) {
  // Make sure the origin is included in both axes
  axisA.range[1] = Math.max(0, axisA.range[1]);
  axisB.range[1] = Math.max(0, axisB.range[1]);
  axisA.range[0] = Math.min(0, axisA.range[0]);
  axisB.range[0] = Math.min(0, axisB.range[0]);

  const totalRangeA = axisA.range[1] - axisA.range[0];
  const proportionA = axisA.range[1] / totalRangeA;
  const totalRangeB = axisB.range[1] - axisB.range[0];
  const proportionB = axisB.range[1] / totalRangeB;

  // Calculate the difference between the proportions and distribute them within the two axes
  const diff = Math.abs(proportionB - proportionA) / 2;

  // Don't do anything if the difference is too low
  if (diff < 0.01) {
    return;
  }

  // Select the two that will correct the proportion by always augmenting, so the chart is not cut
  if (proportionA < proportionB) {
    // increase axisA max and axisB min
    axisA.range[1] += calculateAbsoluteDiff(axisA.range[1], totalRangeA, diff);
    axisB.range[0] -= calculateAbsoluteDiff(axisA.range[0], totalRangeB, diff);
  } else {
    // increase axisB max and axisA min
    axisB.range[1] += calculateAbsoluteDiff(axisB.range[1], totalRangeB, diff);
    axisA.range[0] -= calculateAbsoluteDiff(axisA.range[0], totalRangeA, diff);
  }
}

export default function updateYRanges(plotlyElement, layout, options) {
  const updates = {};
  if (isObject(layout.yaxis)) {
    updates.yaxis = {
      ...layout.yaxis,
      autorange: true,
      range: null,
    };
  }
  if (isObject(layout.yaxis2)) {
    updates.yaxis2 = {
      ...layout.yaxis2,
      autorange: true,
      range: null,
    };
  }

  return [
    updates,
    () => {
      if (isObject(layout.yaxis)) {
        const axisOptions = options.yAxis[0];
        const defaultRange = plotlyElement.layout.yaxis.range;
        updates.yaxis.autorange = false;
        updates.yaxis.range = calculateAxisRange(defaultRange, axisOptions.rangeMin, axisOptions.rangeMax);
      }

      if (isObject(layout.yaxis2)) {
        const axisOptions = options.yAxis[1];
        const defaultRange = plotlyElement.layout.yaxis2.range;
        updates.yaxis2.autorange = false;
        updates.yaxis2.range = calculateAxisRange(defaultRange, axisOptions.rangeMin, axisOptions.rangeMax);
      }

      if (options.alignYAxesAtZero && isObject(layout.yaxis) && isObject(layout.yaxis2)) {
        alignYAxesAtZero(updates.yaxis, updates.yaxis2);
      }

      return [updates, null]; // no further updates
    },
  ];
}
