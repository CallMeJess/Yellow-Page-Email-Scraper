var casper = require('casper').create();
casper.userAgent('Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0');

casper.on('error', function(msg,backtrace) {
  this.echo("=========================");
  this.echo("ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
  exiterr = true;
});
/*
casper.on("page.error", function(msg, backtrace) {
  this.echo("=========================");
  this.echo("PAGE.ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});
*/

casper.on('remote.message', function(msg) {
  this.echo("remote: "+msg);
});
var fs = require('fs');

var build = {
    numbers: [],
    currentPage: 7,
    currentLocation: 0,
    proceed: true,
    links: [],
    phone: undefined
};

var host = {
    url: 'http://yellowpages.ca',
    area: [
        '/calgary' // /montreal/rcn-7858923-Montreal-Est'
    ],
    keyword: '/plumbing',
    search: function (pageNumber) {
        return host.url + "/search/si/" + pageNumber + host.keyword + host.area;
    }
};

var get = {
    links: function () {
        var query = document.getElementsByClassName('listing__name--link jsListingName');
        var rv = Array.prototype.map.call(query, function (e) {
            return e.getAttribute('href');
        });
        return rv;
    },
    phone: function () {
        var results = document.getElementsByClassName('mlr__submenu__item')[0];
        result = results.textContent.replace(/\D+/g, '');
        return result;
    }
};

var csvfile="output.csv";

function scrape(page) {
    casper.thenOpen(page, function () {
        this.echo('\nSCRAPING: ' + page);
        // gets all the links on the page
        build.links = this.evaluate(get.links);
        for (var i in build.links) {
            // connects to each links
            casper.thenOpen(host.url + build.links[i], function () {
                // gets phone from link
                build.phone = this.evaluate(get.phone);
                if (build.phone !== null) {
                    // get the title of the page
                    var title = this.getTitle();
                    // print business and phone
                    var bname=title//.split('-')[0];
                    this.echo('\nBUSINESS: ' + bname);
                    this.echo('PHONE: ' + build.phone);
                    if (build.numbers.indexOf(build.phone) === -1) {
	                    build.numbers.push(build.phone);
	                    fs.write(csvfile,'"'+ bname + '","' + build.phone + '"\n','a');
	                }
	                else
	                	this.echo("Skipped Duplicate Number");
                }
            });
        }
        // opens main page again
        casper.thenOpen(page, function () {
            // dumps to the screen
                this.echo('\nSCRAPED: ' + build.numbers.length);
                this.echo('DUMP: ' + build.numbers.join(', '));
            // if a next btn exists
            if (this.exists('a.loadmore')) {
                this.echo('\nCONTINUE: Next button found');
                build.currentPage = build.currentPage + 1;
                this.echo('Page Number: ' + build.currentPage);
                scrape(host.search(build.currentPage));
            } else {
                this.echo('COMPLETE: Area complete, no next button');
                // if there's more areas go to the next one
                if (host.area.length > 1 && build.currentLocation <= host.area.length) {
                    this.echo('LOADING: Moving onto next location');
                    build.currentLocation = build.currentLocation + 1;
                    build.currentPage=1;
                    scrape(host.search(build.currentPage));
                } else {
                    this.echo('COMPLETE: All areas completed');
                    this.exit();
                }
            }
        });
    });
}

var cmd_arg = casper.cli.get(0);

if (fs.isFile(csvfile))
    if (cmd_arg == "replace")
        fs.remove(csvfile);
    else
        casper.die("Output csvfile already exists, run with replace option or rename the file");

fs.write(csvfile, '"Business Name","Phone Number"\n', 'w');

casper.start(host.url, function () {
    // init run
    scrape(host.search(build.currentPage));
});

// final exit
casper.run(function () {
    this.echo('\nSCRAPED: ' + build.numbers.length);
    this.echo('DUMP: ' + build.numbers.join(', ')).exit();
    this.exit();
});