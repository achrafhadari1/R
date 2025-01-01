const Mercury = require("@postlight/mercury-parser");
url =
  "https://www.bild.de/politik/inland/habeck-naechste-wirtschafts-klatsche-verbaende-sehen-schwarz-fuer-2025-676e4a95a76b55385dfd6450";
Mercury.parse(url).then((result) => {
  console.log(result.content); // Extracted article content
});
