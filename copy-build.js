const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach(element => {
    const fromPath = path.join(from, element);
    const toPath = path.join(to, element);
    if (fs.lstatSync(fromPath).isDirectory()) {
      copyFolderSync(fromPath, toPath);
    } else {
      fs.copyFileSync(fromPath, toPath);
    }
  });
}

// Clear destination directory if it exists
const dest = path.join(__dirname, 'dist');
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}

// Copy built client assets from adhoc_test_lms/dist to root dist
copyFolderSync(path.join(__dirname, 'adhoc_test_lms/dist'), dest);
console.log('Successfully copied frontend build to root dist directory!');

// Inline CSS to remove render-blocking stylesheet
const htmlFile = path.join(dest, 'index.html');
if (fs.existsSync(htmlFile)) {
  let htmlContent = fs.readFileSync(htmlFile, 'utf8');
  const assetsDir = path.join(dest, 'assets');
  if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    const cssFile = files.find(file => file.startsWith('index-') && file.endsWith('.css'));
    if (cssFile) {
      const cssPath = path.join(assetsDir, cssFile);
      const cssContent = fs.readFileSync(cssPath, 'utf8');
      
      // Matches link tags referencing CSS files
      const cssRegex = /<link\s+[^>]*href="[^"]+\.css"[^>]*>/i;
      if (cssRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(cssRegex, `<style>${cssContent}</style>`);
        fs.writeFileSync(htmlFile, htmlContent, 'utf8');
        console.log(`Successfully inlined CSS from ${cssFile} into index.html!`);
        
        // Clean up the external stylesheet file
        fs.unlinkSync(cssPath);
        console.log(`Deleted external CSS file: ${cssFile}`);
      } else {
        console.warn('Could not find CSS link tag in index.html to replace.');
      }
    } else {
      console.warn('No index-*.css file found to inline.');
    }
  }
}
