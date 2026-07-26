const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'docs', 'img');
const destDir = path.join(__dirname, '..', 'public', 'img');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  let copied = 0;
  for (const file of files) {
    if (file.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
      fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      copied++;
    }
  }
  console.log(`Copied ${copied} images to public/img`);
} else {
  console.log('Source img dir not found at ' + srcDir);
}
