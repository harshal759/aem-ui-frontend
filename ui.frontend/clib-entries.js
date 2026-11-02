const SOURCE_ROOT = __dirname + '/src/main/webpack';

// webpack entries = one per clientlib and one per component level clientlib.
//   key   -> the clientlib / component name used in clientlib.config.js (webpack writes dist/clientlib-<key>)
//   value -> the main.ts of that clientlib
// Keys must be unique across the whole project.

// clientlibs/<clientlib>/components/<component>/main.ts
const commonComponents = {
  helloWorld: SOURCE_ROOT + '/clientlibs/common/components/helloWorld/main.ts',
}

const templateEntries = {
  site: SOURCE_ROOT + '/site/main.ts', // comes with the AEM archetype, keep it
  common: SOURCE_ROOT + '/clientlibs/common/main.ts',
  ...commonComponents,
}

module.exports = { templateEntries };
