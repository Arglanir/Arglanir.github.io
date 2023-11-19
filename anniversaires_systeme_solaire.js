/** calculation library for anniversaires_systeme_solaire.html and others */

/************************* Internationalization ***************************/
const translations = {
    "fr": {}, // default language
    "en": {
        'années mercuriennes': 'Mercurian years',
        'jours sidéraux mercuriens': 'sideral Mercurian days',
        'jours mercuriens': 'Mercurian days',
        'années terrestres': 'Earth years',
        'jours terrestres': 'Earth days',
        '000 heures': '000 hours',
        '000 000 secondes': '000 000 seconds',
        'années vénusiennes': 'Venusian years',
        'jours sidéraux vénusiens': 'sideral Venusian days',
        'jours vénusiens': 'Venusian days',
        'années martiennes': 'Martian years',
        'années joviennes': 'Jovian years',
        'années saturniennes': 'Saturnian years',
        'années ceresiennes': 'Ceresian years',
        'année uranusienne': 'Uranusian years',
        'jours lunaires': 'Moony days',
        '000 semaines': '000 weeks',         
        'chiffres significatifs': 'significative digits',
        ' le ': ' on the ', // age... when
        ' aura ': ' will have ',
        'Date de naissance :' : 'Birth date:',
        'Dates de naissance :' : 'Birth dates:',
        'Date actuelle :' : 'Current date:',
        'Anniversaires dans le système solaire': 'Birth parties in the Solar system',
        'Trouver les prochains anniversaires': 'Find next birthday parties!',
        "Plein d'anniversaires dans le système solaire":"Multiple birthday parties in the solar system",
    }
}

var selected_locale = "en";
for (var lang of navigator.languages) {
    if (translations[lang]) {
        selected_locale = lang;
        break;
    }
}
function t(text) {
    if (selected_locale == "fr") return text; // no warning, default language
    if (translations[selected_locale][text]) return translations[selected_locale][text];
    console.log("Missing "+selected_locale+" translation for: '" + text + "'");
    return text;
}
function translateElement(element) {
    var totranslate = element.innerText;
    var tochange = function (trad) { element.innerText = trad; }
    if (element.hasAttribute(element.getAttribute("arglanir-i18n"))) {
        tochange = function (trad) { element.setAttribute(element.getAttribute("arglanir-i18n"), trad); }
        totranslate = element.getAttribute(element.getAttribute("arglanir-i18n"));
    }
    if (element.hasAttribute("arglanir-i18n-original")) {
        totranslate = element.getAttribute("arglanir-i18n-original");
    }
    var translation = t(totranslate);
    tochange(translation);
}
function translateDoc() {
    document
        // Find all elements that have the key attribute
        .querySelectorAll("[arglanir-i18n]")
        .forEach(translateElement);
    //document.title = t(document.title);
}


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
    'années mercuriennes': MERCURY_YEAR,  // hermanniversaire
    'jours sidéraux mercuriens': 58.6458, // résonnance spin-orbite 3:2
    'jours mercuriens': 2*MERCURY_YEAR,   // hermédiversaire
    'années terrestres': EARTH_YEAR,      // anniversaire
    'jours terrestres': 1,                // kilodiversaire
    '000 heures': 1000/24,
    '000 000 secondes': 1000000/24/3600,  // mégasecondiversaire ? gigasecondiversaire ?
    'années vénusiennes': 224.701,        // vénéranniversaire
    'jours sidéraux vénusiens': 243.023,  // vénediversaire
    'jours vénusiens': 116.75 + 31/86400, //+31s! vénediversaire aussi
    'années martiennes': 686.980,         // aréanniversaire
    'années joviennes': 11.862*EARTH_YEAR,// jovianniversaire
    'années saturniennes': 29.4571*EARTH_YEAR, // saturanniversaire
    'années ceresiennes': 4.60*EARTH_YEAR, // ceresanniversaire
    'année uranusienne': 84.0205*EARTH_YEAR, // ... 1 per life :-)
    'jours lunaires': 29.530589,          // sélédiversaire 
    '000 semaines': 7000,                 // hebdiversaire
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
    
    var dates = calc(date, now, 9);
    
    
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
    translateDoc();
}

/** Calculates the next anniversaries, updates the query and document */
function calcMultiple() {
    
    delete SOLAR_SYSTEM_DURATIONS['jours terrestres'];
    
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
            
            var dates = calc(date, now, 2);
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
    
    var lastDisplayedDay = 1;
    for (var [dat, person, even] of datesAndPeople) {
        var currentDisplayedDay = null;
        try {
            currentDisplayedDay = dat.getDate();
        } catch (e) {
            currentDisplayedDay = new Date(dat).getDate();
        }
        if (currentDisplayedDay != lastDisplayedDay) {
            todisplay += "<hr/>";
        }
        lastDisplayedDay = currentDisplayedDay;
        if (dat - now > 30*864E5) break;
        var birthdate = 
        todisplay += "<p><a href=\"anniversaires_systeme_solaire.html?d=" + names2date[person] + "\">" + person + "</a>" + t(" aura ") + even + "</p>\n";
    }
    // display it
    document.getElementById('result_div').innerHTML = todisplay;
    
    translateDoc();
}

/**
Get the next significant number by the number of minimum significant digit.
*/
function nextSignificantNumber(number, minDigits) {
    let asStr = number.toString();
    if (asStr.length <= minDigits) {
        return number;
    }
    let nbNonSignificantDigits = asStr.length - minDigits;
    if (parseInt(asStr.slice(minDigits)) == 0) {
        return number;
    }
    return (parseInt(asStr.slice(0, minDigits))+1)*Math.pow(10, nbNonSignificantDigits);
}


/** Calculates the next anniversaries
@return array [[date, text],...]
*/
function calc(date, now, significantDigits, boldForSignificantDigits) {
    significantDigits = significantDigits?significantDigits:1;
    boldForSignificantDigits = boldForSignificantDigits?boldForSignificantDigits:1;
    
    var elapsedEarthDays = (now - date)/1000/3600/24 - 1;
    var dates = []; // [future date, event] for sorting
    console.log("Age: " + elapsedEarthDays + " days");
    // calculate for each type
    for (const [type, duration] of Object.entries(SOLAR_SYSTEM_DURATIONS)) {
        var currentAge = elapsedEarthDays/duration;
        var nextAnnivAge = Math.ceil(currentAge);
        var nextAnnivInDays = nextAnnivAge*duration;
        var nextAnnivDate = date.addDays(nextAnnivInDays);
        //dates.push([nextAnnivDate.valueOf(), nextAnnivAge + " " + type + " le " + twoDigits(nextAnnivDate.getDate()) + "/" + twoDigits(nextAnnivDate.getMonth() + 1) + "/" + nextAnnivDate.getFullYear()]);
        // significant digits
        for (var i = 1; i <= significantDigits; i++) {
            var otherAge = nextSignificantNumber(nextAnnivAge, i);
            //if (otherAge == nextAnnivAge) continue;
            if (i > 1 && otherAge == nextSignificantNumber(nextAnnivAge, i-1)) continue;
            var nextAnnivForOtherAge = date.addDays(otherAge * duration);
            var prefix = i<=boldForSignificantDigits ? "<b title=\"" + i + " "+t("chiffres significatifs")+"\">" : "";
            var suffix = i<=boldForSignificantDigits ? "</b>" : "";
            dates.push([nextAnnivForOtherAge, prefix + otherAge + " " + t(type) + t(" le ") + twoDigits(nextAnnivForOtherAge.getDate()) + "/" + twoDigits(nextAnnivForOtherAge.getMonth() + 1) + "/" + nextAnnivForOtherAge.getFullYear() + suffix]);
        }
        /*
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
        */
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
    if (isMultiple) {
        now.setMonth(now.getMonth() + diff);
    } else {
        now.setFullYear(now.getFullYear() + diff);
    }
    document.datation.today.value = [
        now.getFullYear(),
        twoDigits(now.getMonth() + 1),
        twoDigits(now.getDate())].join('-');
    if (isMultiple) calcMultiple()
    else calcOnlyOne();
}