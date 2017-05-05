# Yellow Pages Canada Phone Number Scraper
### About
Scrape Yellow Pages Canada for phone numbers, output the list to CSV file - Script removes duplicate phone numbers.
![Screen shot](http://i.imgur.com/h1yCp0p.png)

### CasperJS
First use [npm](https://nodejs.org/en/download/) to install [casperjs](http://casperjs.org/) -
```sh
$ npm install casperjs
OR
$ npm install -g casperjs
```

### Customize
Update the host{} in scraper.js -
```js
var host = {
    // main connect
    url: 'http://yellowpages.ca',
    // areas to search
    area: [
        'calgary',
        'toronto',
        'montreal'
    ],
    // business keyword
    keyword: 'plumbing',
    // creates complete link
    search: function (pageNumber) {
        return host.url + "/search/si/" + pageNumber + '/' + host.keyword + '/' + host.area;
    }
};
```

### Running
Redirect your terminal to the scraper directory then -
```sh
$ casperjs scraper.js
```
