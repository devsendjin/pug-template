const { exec } = require('child_process');

// execFileSync('./test1.js', ['--some-arg'], {
//   env: process.env.NODE_ENV,
// });


const child = exec('npm run wp', {},
(error, stdout, stderr) => {
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  if (error !== null) {
      console.log(`exec error: ${error}`);
  }
});
