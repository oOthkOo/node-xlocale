/**
 *  Global variables.
 */
var default_locale = '';
var app_locales = [];
var user_locales = [];
var locale = {
  	name: 'unknow',
		lang: 'unknow',
		country: 'unknow',
		quality: 'unknow'
	};;

/**
 *  Public functions.
 */
	
function getLocale() {
	return locale;
}

function getName() {
	return locale.name;
}

function getLang() {
	return locale.lang;
}

function getCountry() {
	return locale.country;
}

function getQuality() {
	return locale.quality;
}

/**
 *  Private functions.
 */

function getLocaleFromString( locale, quality ) {
	
	var alp = locale.split(';');	    		
	var p1 = alp[0];
	var p2 = alp[1];
	
	if (!p1 && !p2) {
		return null;
	}
	
	var pp1 = p1.split('-');
	var lang = pp1[0];
	var country = pp1[1];
	
	if (!lang && !country) {
		return null;
	}	
	
	var q = '';	
	if (p2) {
		var pp2 = p2.split('=');
		q = pp2[1];
	}
	
	lang = lang ? lang.toLowerCase() : '';
	country = country ? country.toUpperCase() : '';
	q = q || quality || '0.0';
	
	return {
		name: lang + '_' + country,
		lang: lang,
		country: country,
		quality: q
	};
}

function compareLocale( a, b ) {
	
	//console.log( parseFloat(a.quality), parseFloat(b.quality));
	/*if () {
		return -1;
	}	    
	if (parseFloat(a.quality) > parseFloat(b.quality)) {
		return 1;
	}*/
	return parseFloat(a.quality) < parseFloat(b.quality);
}

function findLocale( name ) {
	for (var l=0; l<app_locales.length; l++) {
		var locale = app_locales[l];
		if (locale.name == name) {
			return locale;
		}
	}
	return null;	
}

function getBestLocale() {
	for (var l=0; l<user_locales.length; l++) {
		var locale = findLocale(user_locales[l].name);		
		if (locale) {
			//console.log( locale, 'found '  );
			return locale;
		}
	}
	return getDefaultLocale();
}

function getDefaultLocale() {	
	return getLocaleFromString(default_locale,1);
}

function init(options) {

	options = options || {};

	default_locale = options.default_locale || 'en_US';
	default_locale = default_locale.replace('_','-');
	options.locales = options.locales || [];
	
	var quality = 1.0;
	for (var i=0, len=options.locales.length; i<len; i++) {		
		var l = options.locales[i];
		l = l.replace('_','-');
		var al = getLocaleFromString(l + ';q=' + quality);
		if (al) {
			app_locales.push(al);
			quality -= 0.1;			
		}
    }

	return function xlocale(req, res, next) {	    
		var al = req.headers['accept-language'];
	    if (al) {
	    	
	    	user_locales = [];
	    	
	    	al.split(',').forEach(function(lg) {
	    		var result = getLocaleFromString(lg);
	    		if (result) {
	    			user_locales.push(result);
	    			//console.log( result );
	    		}	    		
	    	});
	    	
	    	user_locales.sort(compareLocale);	    	
	    	//console.log( user_locales );
	    	
	    	req.locale = locale = getBestLocale();
	    }
	    else {
	    	req.locale = locale = getDefaultLocale();
	    }	    
	    next();
	};
};

/**
 * Expose functions.
 */

module.exports.init = init;
module.exports.getLocale = getLocale;
module.exports.getName = getName;
module.exports.getQuality = getQuality;
module.exports.getLang = getLang;
module.exports.getCountry = getCountry;
