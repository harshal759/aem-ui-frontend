/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~ Copyright 2020 Adobe Systems Incorporated
 ~
 ~ Licensed under the Apache License, Version 2.0 (the "License");
 ~ you may not use this file except in compliance with the License.
 ~ You may obtain a copy of the License at
 ~
 ~     http://www.apache.org/licenses/LICENSE-2.0
 ~
 ~ Unless required by applicable law or agreed to in writing, software
 ~ distributed under the License is distributed on an "AS IS" BASIS,
 ~ WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ~ See the License for the specific language governing permissions and
 ~ limitations under the License.
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

const path = require('path');
const { projectName, generateClibs, CLIENTLIB_DIR } = require('./clib-generator.js')
const BUILD_DIR = path.join(__dirname, 'dist');

const libsBaseConfig = { // Disables default AEM Minification of clientlibs (webpack already minifies in production)
  allowProxy: true,
  serializationFormat: 'xml',
  cssProcessor: ['default:none', 'min:none'],
  jsProcessor: ['default:none', 'min:none']
};

// Use it as `libsBaseConfig: libsBaseConfigMinify` on a clientlib that should keep the AEM minification
const libsBaseConfigMinify = {
  allowProxy: true,
  serializationFormat: 'xml',
};

// One object per clientlib, see clib-generator.js for every supported property.
// `dependencies` and `site` come with the AEM archetype, keep them as they are.
// `base` (the core components embed list) is a static clientlib in ui.apps, it is not generated here.
const cliArray = [
  { name: 'dependencies' },
  { name: 'site', dependencies: [`${projectName}.dependencies`], resources: true },

  // Sample: a clientlib with one component level clientlib. Replace it with your own clientlibs.
  { name: 'common', components: ['helloWorld'] },
]

const libsArr = []
generateClibs(libsArr, libsBaseConfig, ...cliArray)

// Config for `aem-clientlib-generator`
module.exports = {
  context: BUILD_DIR,
  clientLibRoot: CLIENTLIB_DIR,
  libs: libsArr
};
