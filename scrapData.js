'use strict';
const rp = require('request-promise');
const cheerio = require('cheerio');
const _ = require('underscore');

let parseHTML = (URL, html) => {
    return new Promise((resolve, reject) => {
        let $ = cheerio.load(html);
        let data = [];
        $($('a')).each(function (i, link) {
            const URI = $(link).attr('href');
            if (URI && URI != URL && (URI.startsWith('https://') || URI.startsWith('http://') || URI.startsWith('//'))) {
                data.push(URI);
            }
        });
        return resolve(_.uniq(data));
    })

};

let scrapPage = (URL) => {
    return new Promise((resolve, reject) => {
        rp(URL)
            .then((result) => {
                return parseHTML(URL, result)
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return resolve(err);
            })
    })
};


let scrapAllPage = (URL, pageDepth) => {
    if (!URL instanceof Array) {
        URL = [URL];
    }
    let promiseCall = [];
    URL.forEach((url) => {
        promiseCall.push(scrapPage(url))
    });
    Promise.all(promiseCall)
        .then((result) => {
            URL = _.flatten(result);
            console.log("URL",URL);
            if (pageDepth - 1 > 0){
                scrapAllPage(URL,pageDepth - 1);
            }
        }).catch((err) => {
            console.log("err", err);
        })

};


let websiteName = process.argv[2] || "https://medium.com";
let depth = process.argv[3] || 2;

scrapAllPage([websiteName], depth);