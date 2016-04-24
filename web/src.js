'use strict';

$(function() {
    require('moment/locale/fr');
    let PdfCalendar = require('../index');
    let blobStream  = require('blob-stream');

    let iframe = document.querySelector('iframe');
    let $month = $("#month"), $year = $("#year");

    let generateCalendar = function() {
        let pdf = PdfCalendar.generate($year.val(), $month.val(), "fr");
        let stream = pdf.pipe(blobStream());

        stream.on('finish', function() {
            iframe.src = stream.toBlobURL('application/pdf');
        });
    };
    generateCalendar();

    $month.on('change', generateCalendar);
    $year.on('change', generateCalendar);
});