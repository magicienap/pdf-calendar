'use strict';
let moment = require('moment');

/**
 * @module Calendar
 */

/**
 * Generate a tabular representation of the calendar of a given month
 * of a given year.
 *
 * @example
 * var PdfCalendar = require('pdf-calendar');
 * PdfCalendar.Calendar.generate(2016, 3);
 * // { year: 2016,
 * //   month: 3,
 * //   calendar:
 * //    [ [ null, null, 1, 2, 3, 4, 5 ],
 * //      [ 6, 7, 8, 9, 10, 11, 12 ],
 * //      [ 13, 14, 15, 16, 17, 18, 19 ],
 * //      [ 20, 21, 22, 23, 24, 25, 26 ],
 * //      [ 27, 28, 29, 30, 31 ] ] }
 *
 * @param year {number}
 * @param month {number}
 *
 * @return {Object}
 */
exports.generate = function(year, month) {
    // Initialize the first week of the calendar
    // The first day of the week is Sunday
    let calendar = [
        [null, null, null, null, null, null, null]
    ];

    // Add each day of the month to the calendar structure
    // under its day of the week
    let currentDate = moment(`${year}-${month}`, 'YYYY-M');
    let nextMonth   = currentDate.clone().add(1, "months");
    while (currentDate.isBefore(nextMonth)) {
        let dayIndex = currentDate.day();

        // Add a new week in the calendar structure on Sundays
        // (except if the first of the month is a Sunday)
        let isFirstSunday = calendar[0].every(day => day === null);
        if (dayIndex == 0 && !isFirstSunday) {
            calendar.push([]);
        }
        calendar[calendar.length - 1][dayIndex] = currentDate.date();

        currentDate.add(1, "days");
    }

    return { year, month, calendar };
};
