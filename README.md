# AEM UI Frontend Module

A plug-and-play add-on for the `ui.frontend` module of an AEM project. It lets you create **as many clientlibs as you need**, each with its own SCSS / JavaScript / TypeScript, and optionally **component level clientlibs**, by adding a few lines of configuration instead of hand-writing clientlib definitions.

---

## Contents

1. [Why this module](#1-why-this-module)
2. [What you get](#2-what-you-get)
3. [Requirements](#3-requirements)
4. [What is in this repository](#4-what-is-in-this-repository)
5. [Out of the box vs. this module](#5-out-of-the-box-vs-this-module)
6. [Quick start: plug it into your project](#6-quick-start-plug-it-into-your-project)
7. [Create a clientlib](#7-create-a-clientlib)
8. [Create a component level clientlib](#8-create-a-component-level-clientlib)
9. [Use a clientlib on a page](#9-use-a-clientlib-on-a-page)
10. [Configuration reference](#10-configuration-reference)
11. [How it works](#11-how-it-works)
12. [Dev, prod and Maven builds](#12-dev-prod-and-maven-builds)
13. [Troubleshooting](#13-troubleshooting)
14. [Upgrading from the earlier version of this module](#14-upgrading-from-the-earlier-version-of-this-module)
15. [Verified with](#15-verified-with)

---

## 1. Why this module

The `ui.frontend` module of the AEM Project Archetype comes with a webpack setup that builds your SCSS / JS and exports the result into `ui.apps` as clientlibs. Out of the box it supports **two clientlibs only**: `dependencies` and `site`. Everything ends up in one big `site` bundle, which is a problem for page weight and for structuring a large project.

This module removes that limit without changing how the archetype works: webpack still builds into `ui.frontend/dist`, and `aem-clientlib-generator` still copies the result into `ui.apps`.

## 2. What you get

- Any number of clientlibs: add the folder, one webpack entry and one config line.
- Component level clientlibs that are generated next to the AEM component and **embedded automatically** into their parent clientlib.
- Modular projects: put clientlibs of one module under their own parent folder and category prefix.
- Per clientlib `embed`, `dependencies`, `resources` (images / fonts) and `noCss` / `noJs` options.
- Choice of AEM minification per clientlib (off by default, since webpack already minifies in production).
- Validation with clear errors for duplicate names and clientlibs without a name.
- Zero change to the archetype's `dependencies`, `site` and static `base` clientlibs.

## 3. Requirements

- An AEM project created from the Adobe AEM Project Archetype with the **general** frontend module (`frontendModule=general`), i.e. a `ui.frontend` folder that contains `webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`, `clientlib.config.js` and `src/main/webpack/site/main.ts`.
- The Node and npm versions your project already uses for `ui.frontend`.
- Three extra npm dev dependencies (installed in step 4 of the quick start): `babel-loader`, `@babel/preset-env`, `@babel/preset-typescript`.

## 4. What is in this repository

```
aem-ui-frontend/
├── README.md
└── ui.frontend/                          <- mirrors your project's ui.frontend folder
    ├── clib-entries.js                   webpack entries: one per clientlib / component clientlib
    ├── clib-generator.js                 turns the clientlib.config.js entries into aem-clientlib-generator config
    ├── clientlib.config.js               the list of clientlibs (the file you edit most)
    ├── project-config.js                 your AEM appId + the ui.apps output folders
    ├── webpack.common.js                 archetype file, 4 small changes (see section 5)
    └── src/main/webpack/clientlibs/      SAMPLE clientlib + sample component clientlib
        └── common/
            ├── main.ts
            ├── css/  (main.scss, _variables.scss)
            ├── js/   (log.js)
            └── components/helloWorld/
                ├── main.ts
                ├── css/  (main.scss)
                └── js/   (helloWorld.js)
```

## 5. Out of the box vs. this module

| File in `ui.frontend` | Archetype | With this module |
|---|---|---|
| `clientlib.config.js` | Hard-coded `dependencies` and `site` clientlibs | **Replaced.** Builds the list from a short `cliArray` (`dependencies` and `site` stay, same output as before) |
| `webpack.common.js` | Single `site` entry, two output folders | **Replaced** (4 changes below) |
| `clib-entries.js` | not there | **New.** All webpack entries |
| `clib-generator.js` | not there | **New.** Clientlib generation logic and validation |
| `project-config.js` | not there | **New.** AppId and `ui.apps` paths |
| `src/main/webpack/clientlibs/` | not there | **New.** Home of every additional clientlib (sample included) |
| `webpack.dev.js`, `webpack.prod.js`, `package.json` scripts, `.babelrc`, `tsconfig.json` | | **Unchanged** (only three dev dependencies are added to `package.json`) |
| `ui.apps/.../clientlibs/clientlib-base` | static clientlib embedding the core components | **Unchanged** (not generated by this module) |

The four changes inside `webpack.common.js` are marked with `[aem-ui-frontend]` comments. If your `webpack.common.js` has project specific changes, apply these four by hand instead of replacing the file:

1. `const { templateEntries } = require('./clib-entries');`
2. `entry: templateEntries` (was `entry: { site: SOURCE_ROOT + '/site/main.ts' }`)
3. `output.filename` returns `` `clientlib-${chunkData.chunk.name}/[name].js` `` (was a fixed `clientlib-dependencies` / `clientlib-site`), so every clientlib gets its own folder in `dist`
4. The SCSS rule `test` becomes `/\.s?css$/`, and a new rule is added that runs `babel-loader` (`@babel/preset-env`) on `.js` / `.mjs` files

The only visible difference in the generated `clientlib-site/.content.xml` is an extra empty `embed="[]"` attribute.

## 6. Quick start: plug it into your project

Run all commands from the `ui.frontend` folder of your project.

**Step 1: Copy the module files**

Copy everything inside this repository's `ui.frontend/` folder into your project's `ui.frontend/` folder. Confirm the overwrite of `clientlib.config.js` and `webpack.common.js` (see section 5 if you customised `webpack.common.js`).

**Step 2: Set your appId**

Open `project-config.js` and set `projectName` to your AEM appId, the folder name under `ui.apps/src/main/content/jcr_root/apps/`:

```js
const projectName = 'myproject'
```

All output paths and the category prefix of every clientlib (`myproject.common`, `myproject.site`, ...) are derived from this value.

**Step 3: Review the sample**

The sample `common` clientlib and its `helloWorld` component clientlib prove that the setup works. Keep them for the first build and remove them afterwards (see *Removing the sample* below).

**Step 4: Install the extra dev dependencies**

```bash
npm install --save-dev babel-loader @babel/preset-env @babel/preset-typescript
```

The new `webpack.common.js` rule needs them. Without them the build fails with `Module not found: Error: Can't resolve 'babel-loader'`.

**Step 5: Build**

```bash
npm run dev
```

`npm run dev` runs webpack and then the `clientlib` command, which copies `dist` into `ui.apps`.

**Step 6: Check the result**

`ui.apps/src/main/content/jcr_root/apps/<appId>/` now contains:

```
clientlibs/
├── clientlib-base/            unchanged (static)
├── clientlib-dependencies/    generated, same as before
├── clientlib-site/            generated, same as before
└── clientlib-common/          NEW, embeds <appId>.helloWorld
components/
└── common/helloWorld/clientlibs/   NEW, component level clientlib
```

and the build log contains the lines:

```
processing clientlib: clientlib-dependencies
processing clientlib: clientlib-site
processing clientlib: clientlib-helloWorld
processing clientlib: clientlib-common
```

`clientlib-common/.content.xml` looks like this:

```xml
<jcr:root xmlns:cq="http://www.day.com/jcr/cq/1.0" xmlns:jcr="http://www.jcp.org/jcr/1.0"
    jcr:primaryType="cq:ClientLibraryFolder"
    categories="[myproject.common]"
    embed="[myproject.helloWorld]"
    dependencies="[]"
    cssProcessor="[default:none,min:none]"
    jsProcessor="[default:none,min:none]"
    allowProxy="{Boolean}true"/>
```

> Two webpack warnings `Empty results for import "./**/*.js"` can show up. They come from the archetype's own `site/main.ts` (it globs folders that have no files yet) and are harmless.

**Removing the sample**

1. Delete `src/main/webpack/clientlibs/common`.
2. Remove `commonComponents` and `common: ...` from `clib-entries.js`.
3. Remove `{ name: 'common', components: ['helloWorld'] }` from `clientlib.config.js`.
4. Delete the already generated folders from `ui.apps`: `clientlibs/clientlib-common` and `components/common/helloWorld/clientlibs`. The generator never deletes folders of clientlibs you removed from the config.

## 7. Create a clientlib

Example: a clientlib called `checkout`.

**Step 1: Create the folder.** Inside `src/main/webpack/clientlibs/` create a folder with the clientlib name and two sub folders for the styles and scripts:

```
src/main/webpack/clientlibs/checkout/
├── css/
│   └── main.scss
└── js/
    └── checkout.js
```

**Step 2: Create `main.ts`** in the same folder as `css` and `js`. It pulls in every SCSS and JS file of the clientlib:

```ts
import './css/*.scss';
import './js/*.js';
```

**Step 3: Add the webpack entry** in `clib-entries.js`. The key is the clientlib name:

```js
const templateEntries = {
  site: SOURCE_ROOT + '/site/main.ts',
  common: SOURCE_ROOT + '/clientlibs/common/main.ts',
  checkout: SOURCE_ROOT + '/clientlibs/checkout/main.ts',
  ...commonComponents,
}
```

**Step 4: Add the clientlib** to `cliArray` in `clientlib.config.js`:

```js
const cliArray = [
  { name: 'dependencies' },
  { name: 'site', dependencies: [`${projectName}.dependencies`], resources: true },
  { name: 'common', components: ['helloWorld'] },
  { name: 'checkout' },
]
```

**Step 5: Build** with `npm run dev`. The result is `ui.apps/.../apps/<appId>/clientlibs/clientlib-checkout` with the category `<appId>.checkout`.

Rules to remember:

- The entry key in `clib-entries.js` and the `name` in `clientlib.config.js` must be identical. webpack writes `dist/clientlib-<key>` and the generator reads exactly that folder.
- Names are unique across the project, clientlibs and components together.
- SCSS / JS files inside `css/` and `js/` are imported in alphabetical order. Prefix a partial with `_` for variables / mixins (`_variables.scss`).
- To use images or fonts, set `resources: true` on the clientlib. Everything in `dist/clientlib-<name>` that is not JS or CSS is then copied into the clientlib. (The archetype's `src/main/webpack/resources` folder is copied into `clientlib-site` only.)

## 8. Create a component level clientlib

Component level clientlibs are generated **inside `ui.apps/.../components/<clientlib>/<component>/clientlibs`** and are embedded automatically into the parent clientlib. Use them when a component has its own CSS / JS that should live next to the component.

Example: a clientlib `checkout` with the components `cart` and `payment`.

**Step 1: Create the folders** under the parent clientlib, in a `components` folder. Each component has the same structure as a clientlib:

```
src/main/webpack/clientlibs/checkout/
├── main.ts                      (+ css/ js/ if the parent has its own styles / scripts)
└── components/
    ├── cart/
    │   ├── main.ts
    │   ├── css/main.scss
    │   └── js/cart.js
    └── payment/
        ├── main.ts
        ├── css/main.scss
        └── js/payment.js
```

**Step 2: Add the entries** in `clib-entries.js`. The key is the **component name**:

```js
const checkoutComponents = {
  cart: SOURCE_ROOT + '/clientlibs/checkout/components/cart/main.ts',
  payment: SOURCE_ROOT + '/clientlibs/checkout/components/payment/main.ts',
}

const templateEntries = {
  site: SOURCE_ROOT + '/site/main.ts',
  checkout: SOURCE_ROOT + '/clientlibs/checkout/main.ts',
  ...checkoutComponents,
}
```

**Step 3: Add the components** to the clientlib in `clientlib.config.js`:

```js
{ name: 'checkout', components: ['cart', 'payment'] },
```

A component can also be an object when it needs options: `{ name: 'payment', resources: true, noJs: true }`.

**Step 4: Build.** The generated structure is:

```
ui.apps/.../apps/<appId>/
├── clientlibs/clientlib-checkout/                  embed="[<appId>.cart,<appId>.payment]"
└── components/checkout/
    ├── cart/clientlibs/                            category <appId>.cart
    └── payment/clientlibs/                         category <appId>.payment
```

Rules to remember:

- The parent clientlib name (`checkout`) is used as the folder under `components`. Name it after the component group folder of your AEM components (`apps/<appId>/components/<group>/<component>`) so the clientlib is generated next to the component.
- Pages that include `<appId>.checkout` get the CSS / JS of all its components. A page can also include only `<appId>.cart`.
- Component names must be unique across the project (they are webpack entry keys and clientlib categories).

## 9. Use a clientlib on a page

Add the category to the page component, in `ui.apps/.../apps/<appId>/components/page/customheaderlibs.html` (CSS) and `customfooterlibs.html` (JS), the same way the archetype does for `base`:

```html
<sly data-sly-use.clientlib="core/wcm/components/commons/v1/templates/clientlib.html">
    <sly data-sly-call="${clientlib.css @ categories='myproject.checkout'}"/>
    <sly data-sly-call="${clientlib.js @ categories='myproject.checkout'}"/>
</sly>
```

Alternatively add the category to the clientlib list of the page policy in the template editor. To load a clientlib from another one, use `embed` (merged into the same file) or `dependencies` (loaded before it).

## 10. Configuration reference

### Properties of a clientlib in `cliArray`

| Property | Type | Description |
|---|---|---|
| `name` | string, **required** | Clientlib name. Must match its key in `clib-entries.js`. Output folder `clientlib-<name>`, category `<appId>.<name>` |
| `components` | array | Component level clientlibs. Each item is a name (`'cart'`) or an object `{ name, resources, noCss, noJs }` |
| `module` | string | Parent folder and category prefix for projects with several modules. Output moves to `clientlibs/<module>/clientlib-<name>`, the category becomes `<module>.<name>` (use that prefix in `embed` / `dependencies` references). Works together with `components` (`components/<module>/<name>/<component>/clientlibs`) |
| `embed` | array | Categories embedded into this clientlib. Component categories are added automatically |
| `dependencies` | array | Categories added as dependencies |
| `resources` | boolean | Also copy every non JS / CSS file (images, fonts) into the clientlib |
| `noCss` / `noJs` | boolean | Skip the CSS / JS of this clientlib |
| `libsBaseConfig` | object | Replaces the default base config for this clientlib, e.g. `libsBaseConfig: libsBaseConfigMinify` to keep the AEM minification |

### Where the files end up

| What | `ui.apps` path | Category |
|---|---|---|
| Clientlib `x` | `clientlibs/clientlib-x` | `<appId>.x` |
| Clientlib `x` with `module: 'm'` | `clientlibs/m/clientlib-x` | `m.x` |
| Component `c` of clientlib `x` | `components/x/c/clientlibs` | `<appId>.c` |
| Component `c` of clientlib `x` with `module: 'm'` | `components/m/x/c/clientlibs` | `m.c` |

All paths are relative to `ui.apps/src/main/content/jcr_root/apps/<appId>/`.

### Default base config

Defined at the top of `clientlib.config.js`. By default AEM's own JS / CSS minification is switched off (`default:none`, `min:none`) because webpack already minifies in production mode. Use `libsBaseConfigMinify` on a clientlib to turn it back on.

## 11. How it works

```
 clib-entries.js                clientlib.config.js
 (webpack entries)              (list of clientlibs)  --uses-->  clib-generator.js + project-config.js
        |                                   |
        v                                   |
 webpack (webpack.common.js)                |
  src/main/webpack/clientlibs/<x>/main.ts   |
        |                                   |
        v                                   v
 ui.frontend/dist/clientlib-<x>/<x>.js|css  --->  aem-clientlib-generator ("clientlib" command)
                                                          |
                                                          v
                                       ui.apps/.../clientlibs/clientlib-<x>
                                       ui.apps/.../components/<x>/<comp>/clientlibs
```

1. `clib-entries.js` tells webpack which `main.ts` files to build. Each entry produces `dist/clientlib-<key>/<key>.js` and `<key>.css`.
2. `clientlib.config.js` lists the clientlibs. `clib-generator.js` converts that list into the structure `aem-clientlib-generator` expects, adding categories, embeds, dependencies and output paths from `project-config.js`.
3. `npm run dev` / `npm run prod` run webpack and then the `clientlib` command, which reads `clientlib.config.js`, takes the files from `dist` and writes `.content.xml`, `css.txt`, `js.txt` and the files into `ui.apps`.

## 12. Dev, prod and Maven builds

| Command (in `ui.frontend`) | What it does |
|---|---|
| `npm run dev` | webpack in development mode (readable output, easier debugging) + export to `ui.apps`. Recommended while developing |
| `npm run prod` | webpack in production mode (minified) + export to `ui.apps` |
| `mvn clean install` | The Maven build runs the production build of `ui.frontend` as part of the project build |
| `npm run watch` | Rebuilds and syncs to a local AEM on change (archetype script, unchanged) |

## 13. Troubleshooting

| Problem | Cause and fix |
|---|---|
| `Module not found: Error: Can't resolve 'babel-loader'` | Quick start step 4 was skipped. Run `npm install --save-dev babel-loader @babel/preset-env @babel/preset-typescript` |
| `"<appId>.x" is defined more than once` | Two clientlibs, or a clientlib and a component, share a name. Names must be unique across the project |
| `every clientlib needs a "name"` | An object in `cliArray` has no `name` |
| Clientlib folder is generated but has no CSS / JS | The `clib-entries.js` key differs from the `name` in `clientlib.config.js`, or `main.ts` imports nothing. Check `dist/clientlib-<name>` |
| `Module not found` for a `main.ts` | Wrong path in `clib-entries.js` |
| Files are generated under the wrong `apps/<folder>` | `projectName` in `project-config.js` is not your appId |
| Styles / scripts do not load on the page | The category is not included in the page (section 9), or you used the wrong prefix (`module` changes it) |
| A clientlib you removed from the config is still in `ui.apps` | The generator never deletes. Remove `clientlib-<name>` (and the component `clientlibs` folders) from `ui.apps` manually |
| Warnings `Empty results for import "./**/*.js"` | Harmless, from the archetype's `site/main.ts` |

## 14. Upgrading from the earlier version of this module

If you used the previous version (the GitLab repository `aem-frontend-module`):

- Component clientlibs are now generated in `.../clientlibs` (plural). Earlier versions of the generator used `.../clientlib`. Delete the old `clientlib` folders after the first build.
- The sample `base` clientlib is gone from `clientlib.config.js`. `clientlib-base` is a static clientlib of the archetype and is not generated by this module.
- `clib-generator.js` now requires `path` and reads the component name correctly. Earlier copies fail with `ReferenceError: path is not defined` or `Cannot access 'compName' before initialization`.
- `webpack.common.js` needs `babel-loader`, `@babel/preset-env` and `@babel/preset-typescript` (quick start step 4).
- Clientlibs and components now have to be unique, and the build fails with an explicit message otherwise.

## 15. Verified with

Applied to a freshly generated archetype `ui.frontend` module and built with `npm run dev` and `npm run prod`: Node 22.19, npm 10.5, webpack 5.85, `aem-clientlib-generator` 1.8. The generated clientlib configuration is identical to the configuration produced by the previous version of the generator for an existing 22-clientlib production project.
