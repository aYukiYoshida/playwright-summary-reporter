/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require ('fs');
const readline = require ('readline').createInterface ({
  input: process.stdin,
  output: process.stdout,
});
const pkg = require ('../package.json');
/* eslint-enable @typescript-eslint/no-var-requires */

const confirmToProceed = (message, callback) => {
  readline.question (`${message} (y/n): `, answer => {
    if (answer.toLowerCase () !== 'y') {
      readline.close ();
      console.log ('Cancelled package');
      return;
    }

    callback ();
  });
};

console.log (`Current package version: ${pkg.version}`);

confirmToProceed ('Is the set version correct for this release?', () => {
  const releasePackage = {...pkg};
  delete releasePackage.scripts;

  try {
    fs.writeFileSync ('dist/package.json', JSON.stringify (releasePackage));
    fs.copyFileSync ('README.md', 'dist/README.md');
    fs.copyFileSync ('LICENSE', 'dist/LICENSE');
    fs.mkdirSync ("dist/src/bin", { recursive: true });
    fs.copyFileSync ('src/bin/cli.js', 'dist/src/bin/cli.js');

    console.log ('Packaged');
  } catch (err) {
    console.error (err);
  }

  readline.close ();
});
