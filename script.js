// little helper class to make mixed-unit math easier (must be at top of file)
class Dimension {
    constructor(value, units) {
        this.value = value;
        this.units = units;
    }
    valueOf() {
        if (this.units == 'in') {
            return this.value;
        }
        if (this.units == 'cm') {
            return this.value * .3937;
        }
        throw 'Dimension object has invalid units';
    }
}

/* -------------------------------------------------------------- */

// here's where you configure the dot grid
// you do not have to use all the same units
// however the only options are 'in' and 'cm'
var numPages = 200;
var dotSpacing = new Dimension(.5, 'cm');

// page height and width should match the final
// dimensions of the book, not the full sheet size
var pageHeight = new Dimension(8.5, 'in');
var pageWidth = new Dimension(5.5, 'in');

// margins can be whatever you want (printer permitting)
var marginTop = new Dimension(1, 'cm');;
var marginBottom = new Dimension(1, 'cm');
var marginInner = new Dimension(0, 'cm');
var marginOuter = new Dimension(.5, 'cm');

var binderyName = 'Example Books'; // your name :)
var frontMatter = true; // set to false if you don't want front matter
var pageNumbers = true; // set to false if you don't want page numbers

/* -------------------------------------------------------------- */

// here's where we do some shenanigans to get the number of dots per page
var height = pageHeight - (marginTop + marginBottom);
var width = pageWidth - (marginInner + marginOuter);
var rows = Math.trunc(height / dotSpacing);
var cols = Math.trunc(width / dotSpacing);
var items = rows * cols; // phew

// get a handle on the anchor div to put the dot grid in
var container = document.getElementById('container');

// let's get some dots!!! yeah babey
for (var i = 0; i < numPages; i++) {
    var page = document.createElement('div');
    page.className = 'page';
    container.appendChild(page);
    var grid = document.createElement('div');
    var gridStyle = `
        display: grid;
        grid-auto-rows: ${dotSpacing.value}${dotSpacing.units};
        grid-template-columns: repeat(auto-fill, ${dotSpacing.value}${dotSpacing.units});`;
    // if you've made changes such that the dot grid starts on an even page, change i % 2 == 0 to i % 2 != 0
    grid.style = i % 2 == 0 ? gridStyle + 'justify-content: start;' : gridStyle + 'justify-content: end;';
    page.appendChild(grid)
    for (var j = 0; j < items; j++) {
        var item = document.createElement('div');
        item.className = 'item';
        grid.appendChild(item);
    }
}

// this is the only way to control @page styles with javascript
// if you want to change the look of the page numbers, do it here
var pageStyles = document.createElement('style');
pageStyles.innerHTML = `
    @page {
        ${pageNumbers ? 
        `@bottom-center {
            color: #424242;
            font-size: .75em;
            padding-bottom: 1em;
            content: counter(page);
        }` : ''}
        size: ${pageWidth.value}${pageWidth.units} ${pageHeight.value}${pageHeight.units};
        margin-top: ${marginTop.value}${marginTop.units};
        margin-bottom: ${marginBottom.value}${marginBottom.units};
    }
    @page :nth(-n+2) {
        @bottom-center {
            content: none;
        }
    }
    @page :first {
        counter-set: page -1;
    }
    @page dots:right {
        margin-left: ${marginInner.value}${marginInner.units};
        margin-right: ${marginOuter.value}${marginOuter.units};
    }
    @page dots:left {
        margin-left: ${marginOuter.value}${marginOuter.units};
        margin-right: ${marginInner.value}${marginInner.units};
    }`
document.head.appendChild(pageStyles);

// some people might not want the title page etc, so hide that if so
// (divs must remain in place to make blank pages because of reasons)
// (do not ask me why the dot grid can't start on the first page idk)
if (frontMatter == false) {
    var frontStyles = document.createElement('style');
    frontStyles.innerHTML = `
        #titlepage * {
            display: none;
        }
        #preface * {
            display: none;
        }`;
    document.head.appendChild(frontStyles);
} else {
    var dateString = new Date(Date.now()).toLocaleString('en-us', { month: 'long', year: 'numeric' })
    document.getElementById('publisher').innerHTML = `Published by ${binderyName}</br>${dateString}`;
    document.getElementById('bindery').innerHTML = `${binderyName} is a member of the<br/>Renegade Bindery collective`;
}
