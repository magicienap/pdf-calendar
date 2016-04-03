'use strict';
let moment = require('moment');
let fs = require('fs');
let PDFDocument = require('pdfkit');

let Calendar = exports.Calendar = require('./calendar');

/**
 * @module PdfCalendar
 */


/**
 * Number of points in an inch
 * @private
 */
const INCH = 72;

/**
 * Page margin
 * @private
 */
const MARGIN = INCH / 2;

/**
 * Cell padding
 * @private
 */
const PADDING_CELL = INCH / 8;

/**
 * Dimensions of the page
 * @private
 */
const PAGE = {
    WIDTH:  11  * INCH,
    HEIGHT: 8.5 * INCH
};


/**
 * Add the name of the month and the year in the PDF.
 *
 * @param doc {PDFDocument}
 * @param locale {String}
 * @param calendarRepresentation {Object}
 *
 * @private
 */
let addTitle = function(doc, locale, calendarRepresentation) {
    let year  = calendarRepresentation.year,
        month = calendarRepresentation.month;
    
    // In moment.js, months begin at 0
    let monthString = moment.months(month - 1);
    monthString = monthString.charAt(0).toUpperCase() + monthString.slice(1);

    doc.fontSize(24)
       .text(`${monthString} ${year}`,
             { align: "center" })
       .moveDown(1);
};


/**
 * Add each name of the days in the PDF and each cell for each day.
 *
 * @param doc {PDFDocument}
 * @param locale {String}
 * @param calendarRepresentation {Object}
 *
 * @private
 */
let addDays = function(doc, locale, calendarRepresentation) {
    let calendar = calendarRepresentation.calendar;
    let days   = moment.weekdays(),
        nDays  = days.length,
        nWeeks = calendar.length;
    let cellWidth = (PAGE.WIDTH - 2*MARGIN - (nDays-1)*PADDING_CELL) / nDays;

    // Add each name of the days
    let position = { x: doc.x, y: doc.y };
    doc.fontSize(12);
    days.forEach(function(day) {
        doc.text(day.toUpperCase(), position.x, position.y,
                 { width: cellWidth, align: "center" });

        position.x += PADDING_CELL + cellWidth;
    });

    // Add each cell for each day
    let cellHeight =
        (PAGE.HEIGHT - doc.y - MARGIN - (nWeeks-1)*PADDING_CELL) / nWeeks;
    position = { x: MARGIN, y: doc.y };
    doc.fontSize(16);
    calendar.forEach(function(row) {
        // Add a line above each cell
        for (let i = 0; i < nDays; ++i) {
            let endPosition = { x: position.x + cellWidth, y: position.y };

            doc.moveTo(position.x,    position.y)
               .lineTo(endPosition.x, endPosition.y)
               .stroke();

            position.x += PADDING_CELL + cellWidth;
        }

        // Add the day of the month
        position.x = MARGIN;
        row.forEach(function(row) {
            if (row) {
                doc.text(row,
                         position.x + PADDING_CELL/2,
                         position.y + PADDING_CELL/2);
            }
            position.x += PADDING_CELL + cellWidth;
        });

        // Update the position for the next week
        position = { x: MARGIN, y: position.y + PADDING_CELL + cellHeight };
    });
};


/**
 * Generate a PDF for the calendar of a given month of a given year.
 *
 * @example{Generate the calendar for March 2016}
 * var PdfCalendar = require('pdf-calendar');
 * PdfCalendar.generate(2016, 3, "201603.pdf", "en");
 *
 * @param year {number}
 * @param month {number}
 * @param filename {string}
 * @param locale {string}
 */
exports.generate = function(year, month, filename, locale) {
    // Get the tabular representation of the month
    moment.locale(locale);
    let calendarRepresentation = Calendar.generate(year, month);

    // Create the PDF document
    let doc = new PDFDocument({
        layout: "landscape",
        margin: MARGIN,
        info: {
            Title: ""
        }
    });
    doc.pipe(fs.createWriteStream(filename));
    doc.font("fonts/Ubuntu/Ubuntu-Bold.ttf");

    // Generate the calendar in the PDF
    addTitle(doc, locale, calendarRepresentation);
    addDays(doc, locale, calendarRepresentation);

    // Finalize the document
    doc.end();
};
