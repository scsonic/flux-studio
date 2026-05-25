const fontList = require('font-list');
const os = require('os');

let fontsCache = [];
let isFetching = false;

function fetchFonts() {
    if (isFetching) return;
    isFetching = true;
    fontList.getFonts()
        .then(fonts => {
            fontsCache = fonts.map(f => ({
                family: f,
                path: '',
                postscriptName: f,
                style: 'Regular',
                weight: 400
            }));
            console.log(`Fetched ${fontsCache.length} fonts`);
            isFetching = false;
        })
        .catch(err => {
            console.error('Error fetching fonts:', err);
            isFetching = false;
        });
}

// Start fetching fonts immediately
fetchFonts();

module.exports = {
    getAvailableFontsSync: () => {
        if (fontsCache.length === 0) {
            console.warn('getAvailableFontsSync: Cache empty, returning empty list.');
            fetchFonts();
        }
        return fontsCache;
    },
    findFontSync: (options) => {
        console.warn('findFontSync called with', options);
        const font = fontsCache.find(f => f.family === options.family) || fontsCache[0];
        return font || { path: '', family: 'Arial' };
    },
    findFontsSync: (options) => {
        return fontsCache.filter(f => f.family === options.family);
    },
    substituteFontSync: (postscriptName, char) => {
        return { family: 'Arial' };
    }
};

