/** calculation library for anniversaires_systeme_solaire.html and others */
/** Write number as two digits (for days/months) */
function twoDigits(z) {
    return z.toString().padStart(2, '0');
}

/** Set the current date as default */
function defaultDate() {
    var now = new Date();
    try {
        document.datation.birth.value = [
            now.getFullYear() - 40,
            twoDigits(now.getMonth() + 1),
            twoDigits(now.getDate())].join('-');
        if (window.location.toString().indexOf('?d=')>-1) {
            document.datation.birth.value = window.location.toString().split('?d=')[1];
        }
    } catch (e) {
        document.datation.births.value = 
            [now.getFullYear() - 40,
            twoDigits(now.getMonth() + 1),
            twoDigits(now.getDate())].join('-')+ " You" ;
            
        if (window.location.toString().indexOf('?d=')>-1) {
            document.datation.births.value = decodeURI(window.location.toString().split('?d=')[1]);
        }

    }
    document.datation.today.value = [
        now.getFullYear(),
        twoDigits(now.getMonth() + 1),
        twoDigits(now.getDate())].join('-');
}

// The possible periods
const EARTH_YEAR = 365.256363004;
const MERCURY_YEAR = 87.9691;
// in days
const SOLAR_SYSTEM_DURATIONS = {
    'années mercuriennes': MERCURY_YEAR,
    'jours sidéraux mercuriens': 58.6458, // résonnance spin-orbite 3:2
    'jours mercuriens': 2*MERCURY_YEAR, 
    'années terrestres': EARTH_YEAR,
    'jours terrestres': 1,
    '000 heures': 1000/24,
    '000 000 secondes': 1000000/24/3600,
    'années vénusiennes': 224.701,
    'jours sidéraux vénusiens': 243.023,
    'jours vénusiens': 116.75 + 31/86400, //+31s
    'années martiennes': 686.980,
    'années joviennes': 11.862*EARTH_YEAR,
    'années saturniennes': 29.4571*EARTH_YEAR,
    'années ceresiennes': 4.60*EARTH_YEAR,
    'année uranusienne': 84.0205*EARTH_YEAR,
    'jours lunaires': 29.530589,
    
}

/** Utility functions */
Date.prototype.addDays=function(d){return new Date(this.valueOf()+864E5*d);};

function dateIntputToObj(inputValue) {
    var dateStr = inputValue;
    var t = dateStr.split('-');
    var date = new Date(parseInt(t[0]),parseInt(t[1])-1,parseInt(t[2]));
    date.setHours(12);
    return date;
}

/** Calculates the next anniversaries, updates the query and document */
function calcOnlyOne() {
    // extract value
    var date = dateIntputToObj(document.datation.birth.value);
    console.log(date);
    // update url
    var lastUrl = window.location.toString();
    var nextUrl = lastUrl.indexOf('?d=')>-1 ? lastUrl.replace(/\?d=.*/, '?d='+document.datation.birth.value) : lastUrl + "?d=" + document.datation.birth.value;
    window.history.pushState({},"", nextUrl);
    // get current age
    var now = dateIntputToObj(document.datation.today.value);
    
    dates = calc(date, now);
    
    
    var todisplay = "";
    var sepplaced = false;
    for (var [dat, even] of dates) {
        if (!sepplaced && dat - now > 365*864E5) {
            sepplaced = true;
            todisplay += "<hr/>";
        }
        todisplay += "<p>" + even + "</p>\n";
    }
    // display it
    document.getElementById('result_div').innerHTML = todisplay;
}


/** Calculates the next anniversaries, updates the query and document */
function calcMultiple() {
    // extract value
    var birthdates = document.datation.births.value;
    // update url
    var lastUrl = window.location.toString();
    var nextUrl = lastUrl.indexOf('?d=')>-1 ? lastUrl.replace(/\?d=.*/, '?d='+encodeURI(birthdates)) : lastUrl + "?d=" + encodeURI(birthdates);
    window.history.pushState({},"", nextUrl);
    

    // today
    var now = dateIntputToObj(document.datation.today.value);
    // parse birthdates
    var datesAndNames = birthdates.split('\n');
    var names2date = {};
    var datesAndPeople = [];
    for (var dateAndName of datesAndNames) {
        var splitted = dateAndName.match(/(\S+)\s+(.*)/);
        try {
            var person = splitted[2];
            var date = dateIntputToObj(splitted[1]);
            names2date[person] = [date.getFullYear(), twoDigits(date.getMonth() + 1), twoDigits(date.getDate())].join('-');
            
            var dates = calc(date, now);
            for (var table of dates) {
                datesAndPeople.push([table[0], person, table[1]]);
            }
            
        } catch (e) {
            // error of parsing
            console.log("Error parsing " + dateAndName);
            console.log(e);
        }
        
    }
    // sort
    datesAndPeople.sort(function (a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0});
    
    // display it
    var todisplay = "";    
    
    var sepplaced = false;
    for (var [dat, person, even] of datesAndPeople) {
        if (!sepplaced && dat - now > 8*864E5) {
            sepplaced = true;
            todisplay += "<hr/>";
        }
        if (dat - now > 30*864E5) break;
        var birthdate = 
        todisplay += "<p><a href=\"anniversaires_systeme_solaire.html?d=" + names2date[person] + "\">" + person + "</a> aura " + even + "</p>\n";
    }
    // display it
    document.getElementById('result_div').innerHTML = todisplay;
}

/** Calculates the next anniversaries
@return array [[date, text],...]
*/
function calc(date, now) {
    
    var elapsedEarthDays = (now - date)/1000/3600/24 - 1;
    var dates = []; // [future date, event] for sorting
    console.log("Age: " + elapsedEarthDays + " days");
    // calculate for each type
    for (const [type, duration] of Object.entries(SOLAR_SYSTEM_DURATIONS)) {
        var currentAge = elapsedEarthDays/duration;
        var nextAnnivAge = Math.ceil(currentAge);
        var nextAnnivInDays = nextAnnivAge*duration;
        var nextAnnivDate = date.addDays(nextAnnivInDays);
        dates.push([nextAnnivDate.valueOf(), nextAnnivAge + " " + type + " le " + twoDigits(nextAnnivDate.getDate()) + "/" + twoDigits(nextAnnivDate.getMonth() + 1) + "/" + nextAnnivDate.getFullYear()]);
        // multiples of 5
        var multiple = 5;
        if (nextAnnivAge < 5) {
            continue;
        } else if (nextAnnivAge <= 50) {
            // keep 5
        } else if (nextAnnivAge <= 100) {
            multiple = 10;
        } else if (nextAnnivAge <= 200) {
            multiple = 20;
        } else {
            multiple = Math.ceil(nextAnnivAge / 100)*10;
        }
        var currentAgeBy5 = elapsedEarthDays/duration/multiple;
        var nextAnnivAgeBy5 = Math.ceil(currentAgeBy5);
        var nextAnniv5InDays = nextAnnivAgeBy5*duration*multiple;
        if (Math.floor(Math.abs(nextAnniv5InDays-nextAnnivInDays)) == 0) {
            continue;
        }
        var nextAnniv5Date = date.addDays(nextAnniv5InDays);
        dates.push([nextAnniv5Date, "<b>" + nextAnnivAgeBy5*multiple + " " + type + " le " + twoDigits(nextAnniv5Date.getDate()) + "/" + twoDigits(nextAnniv5Date.getMonth() + 1) + "/" + nextAnniv5Date.getFullYear() + "</b>"]);
    }
    // sort by event date
    dates.sort(function (a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0});
    
    return dates;
}
/** event handler if enter pressed */
function calcIfEnter(isMultiple) {
    if(event.keyCode == 13) {
        if (isMultiple) calcMultiple()
        else calcOnlyOne();
    }
}
/** change todays' date */
function updateToday(diff, isMultiple) {
    var now = dateIntputToObj(document.datation.today.value);
    now.setFullYear(now.getFullYear() + diff);
    document.datation.today.value = [
        now.getFullYear(),
        twoDigits(now.getMonth() + 1),
        twoDigits(now.getDate())].join('-');
    if (isMultiple) calcMultiple()
    else calcOnlyOne();
}