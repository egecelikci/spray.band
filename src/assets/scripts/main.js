// Module Preload
import "vite/modulepreload-polyfill";

// Main Stylesheet
import "../styles/index.css";
import "../styles/prism-diff.css";

// Common Modules
import "./common/register-serviceworker";

import "/node_modules/@zachleat/heading-anchors/heading-anchors.js";
