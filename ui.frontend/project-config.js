const path = require('path');

// Replace with your AEM appId = the folder name under ui.apps/src/main/content/jcr_root/apps/
// It is also the category prefix of every clientlib (<appId>.<clientlib name>)
const projectName = 'project_name'

const COMP_DIR = path.join(
  __dirname,
  '..',
  'ui.apps',
  'src',
  'main',
  'content',
  'jcr_root',
  'apps',
  projectName,
  'components'
)

const CLIENTLIB_DIR = path.join(
  __dirname,
  '..',
  'ui.apps',
  'src',
  'main',
  'content',
  'jcr_root',
  'apps',
  projectName,
  'clientlibs'
);

module.exports = { projectName, CLIENTLIB_DIR, COMP_DIR }