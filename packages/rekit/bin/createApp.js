'use strict';

// Summary:
//  Create a new project.

const path = require('path');
const fs = require('fs');
const download = require('download-git-repo');
const utils = require('./utils');
// function download(a1, dest, callback) {console.log('creating from: ', a1);
//   utils.copyFolderRecursiveSync(path.join(__dirname, '../../../../rekit-boilerplate-cra'), dest, p => !/node_modules|\/coverage|\/build/.test(p));
//   callback();
// }

function createApp(args) {
  const prjName = args.name;
  if (!prjName) {
    console.log('Error: please specify the project name.');
    process.exit(1);
  }
  // The created project dir
  const prjPath = path.join(process.cwd(), prjName);
  if (fs.existsSync(prjPath)) {
    console.log(`Error: target folder already exists: ${prjPath}`);
    process.exit(1);
  }
  console.log('Welcome to Rekit!');
  fs.mkdirSync(prjPath);

  // Download boilerplate from: https://github.com/supnate/rekit-boilerplate-xxx dist branch.
  const tplRepo = args.template === 'rekit' ? `supnate/rekit-boilerplate#dist` : `supnate/rekit-boilerplate-${args.template}#dist`;
  console.log(`Downloading boilerplate from https://github.com/${tplRepo}...`);
  download(tplRepo, prjPath, (err) => {
    if (err) {
      console.log('Failed to download the boilerplate. The project was not created. Please check and retry.');
      console.log(err);
      utils.deleteFolderRecursive(prjPath);
      process.exit(1);
    } else {
      // Modify package.json
      const appPkgJson = require(path.join(prjPath, 'package.json')); // eslint-disable-line
      appPkgJson.name = prjName;
      appPkgJson.description = `${prjName} created by Rekit.`;
      fs.writeFileSync(path.join(prjPath, 'package.json'), JSON.stringify(appPkgJson, null, '  '));

      // Execute postCreate in the boilerplate, so that it could handle '--clean', '--sass' flags.
      const postCreateScript = path.join(prjPath, 'postCreate.js');
      if (fs.existsSync(postCreateScript)) {
        console.log('Post creating...');
        const postCreate = require(postCreateScript);
        postCreate(args);
        fs.unlinkSync(postCreateScript);
      }

      console.log('Project creation success!');
      console.log(`To run the project, please go to the project folder "${prjName}" and:`);
      console.log('  1. Run "npm install" to install dependencies.');
      console.log('  2. Run "npm start" to start the dev server.');
      console.log('Enjoy!');
      console.log('');
    }
  });
}

module.exports = createApp;
