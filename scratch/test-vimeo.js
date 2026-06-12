import { getEmbedUrl } from "../adhoc_test_lms/src/utils/videoUtils.js";

const testUrls = [
  "https://vimeo.com/123456789",
  "https://vimeo.com/123456789/abcdef1234",
  "https://vimeo.com/123456789/abcdef1234?foo=bar",
  "https://player.vimeo.com/video/123456789?h=abcdef1234"
];

console.log("Testing getEmbedUrl results:");
testUrls.forEach(url => {
  console.log(`\nInput:  ${url}`);
  console.log(`Output: ${getEmbedUrl(url)}`);
});
