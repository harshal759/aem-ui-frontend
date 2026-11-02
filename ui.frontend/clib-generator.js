/*
 * Builds the `libs` array consumed by `aem-clientlib-generator` (see clientlib.config.js).
 *
 * Every object passed to generateClibs() describes ONE clientlib. Supported properties:
 *
 *   name          [string, required] clientlib name. Must match the key used for it in clib-entries.js.
 *   components    [array]   component level clientlibs. Each item is either the component name
 *                           ('popups') or an object ({ name, resources, noCss, noJs }).
 *   module        [string]  parent folder + category prefix, for projects with several modules.
 *   embed         [array]   categories to embed into this clientlib.
 *   dependencies  [array]   categories to add as dependencies.
 *   resources     [boolean] also copy every non js / css file (images, fonts...) into the clientlib.
 *   noCss / noJs  [boolean] do not copy the css / js of this clientlib.
 *   libsBaseConfig[object]  replaces the default base config (clientlib.config.js) for this clientlib.
 */
const path = require('path')
const { projectName, CLIENTLIB_DIR, COMP_DIR } = require('./project-config.js')

function createAssets(name, withResources, noCss, noJs) {

  const assets = {}

  // webpack writes every clientlib to dist/clientlib-<name>
  const resources = {
    cwd: `clientlib-${name}`,
    files: ['**/*.*'],
    flatten: false,
    ignore: ['**/*.js', '**/*.css']
  }

  const cssObj = {
    cwd: `clientlib-${name}`,
    files: ['**/*.css'],
    flatten: false
  }

  const jsObj = {
    cwd: `clientlib-${name}`,
    files: ['**/*.js'],
    flatten: false
  }

  if (withResources) assets['resources'] = resources
  if (!noCss) assets['css'] = cssObj
  if (!noJs) assets['js'] = jsObj

  return assets;
}

function generateClibs (libsArr, libsBaseConfig, ...clObj) {

  const categories = new Set(libsArr.map((lib) => lib.categories[0]))

  const register = (libsObj) => {
    const category = libsObj.categories[0]
    if (categories.has(category)) {
      throw new Error(`[clientlib.config.js] "${category}" is defined more than once. Clientlib and component names must be unique.`)
    }
    categories.add(category)
    libsArr.push(libsObj)
  }

  clObj.forEach((cl) => {

    if (!cl.name) throw new Error('[clientlib.config.js] every clientlib needs a "name"')

    const module = cl.module || '';
    const clName = cl.name;
    const libsBase = cl.libsBaseConfig || libsBaseConfig

    const embed = [...(cl.embed || [])]

    cl.components?.forEach((comp) => {

      const compName = comp.name || comp;

      const libsObj = {
        ...libsBase,
        name: `clientlib-${compName}`,
        categories: [`${module || projectName}.${compName}`],
        outputPath: path.join(COMP_DIR, module, clName, compName, 'clientlibs'),
        assets: createAssets(compName, comp.resources, comp.noCss, comp.noJs)
      }

      register(libsObj)
      // the parent clientlib embeds its components, so pages only need to include the parent
      embed.push(libsObj.categories[0])
    })

    register({
      ...libsBase,
      name: `clientlib-${clName}`,
      categories: [`${module || projectName}.${clName}`],
      outputPath: path.join(CLIENTLIB_DIR, module, `clientlib-${clName}`),
      embed: embed,
      dependencies: cl.dependencies ? cl.dependencies : [],
      assets: createAssets(clName, cl.resources, cl.noCss, cl.noJs)
    })
  })
}

module.exports = { projectName, generateClibs, CLIENTLIB_DIR }
