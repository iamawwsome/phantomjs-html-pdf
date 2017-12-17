const webpage = require('webpage');
const system = require('system');
const args = system.args;

const input = args[1];
const output = args[2];


if (!output) {
  throw new Error('Missing output args.');
}

const page = webpage.create();

page.open(input, function() {
  page.paperSize = {
    width: '8.5in',
    height: '11in',
    header: {
      height: '1cm',
      contents: phantom.callback(function(pageNum, numPages) {
        return ('<h1 style="font-size: 12px">' + page.title + '<span style="float:right">' + pageNum + ' / ' + numPages + '</span></h1>');
      })
    },
    footer: {
      height: '1cm',
      contents: phantom.callback(function(pageNum, numPages) {
        return ('<h1 style="font-size: 12px">' + page.title + '<span style="float:right">' + pageNum + ' / ' + numPages + '</span></h1>');
      }),
    },
  };

  page.render(output);
  phantom.exit();
});
