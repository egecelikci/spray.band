import {
	IdAttributePlugin,
	InputPathToUrlTransformPlugin,
	HtmlBasePlugin,
} from "@11ty/eleventy";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import pluginSyntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginNavigation from "@11ty/eleventy-navigation";
import { eleventyImageTransformPlugin as pluginImageTransform } from "@11ty/eleventy-img";

import pluginPageAssets from "eleventy-plugin-page-assets";
import pluginSVGSprite from "eleventy-plugin-svg-sprite";
import pluginFilters from "./utils/filters.js";
import transforms from "./utils/transforms.js";
import shortcodes from "./utils/shortcodes.js";

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const CONTENT_GLOBS = {
	posts: "src/posts/**/*.md",
	drafts: "src/drafts/**/*.md",
	notes: "src/notes/*.md",
	media: "*.jpg|*.png|*.gif|*.mp4|*.webp|*.webm",
};

/** @param {import("@11ty/eleventy").UserConfig} config */
export default async function (config) {
	// Plugins
	config.addPlugin(pluginPageAssets, {
		mode: "directory",
		postsMatching: "src/posts/*/*.md",
		assetsMatching: CONTENT_GLOBS.media,
		silent: true,
	});
	config.addPlugin(pluginSVGSprite, {
		path: "./src/assets/icons",
		outputFilepath: "./dist/assets/icons/icons.sprite.svg",
	});
	config.addPlugin(pluginImageTransform, {
		extensions: "html",
		formats: ["avif", "auto"],
		outputDir: "./dist/assets/images/processed/",
		urlPath: "/assets/images/processed/",
		widths: ["auto"],
		defaultAttributes: {
			loading: "lazy",
			decoding: "async",
		},
	});

	config.addLayoutAlias("base", "base.njk");
	config.addLayoutAlias("home", "home.njk");
	config.addLayoutAlias("page", "page.njk");
	config.addLayoutAlias("post", "post.njk");
	config.addLayoutAlias("draft", "draft.njk");
	config.addLayoutAlias("note", "note.njk");

	// Copy the contents of the `public` folder to the output folder
	// For example, `./public/css/` ends up in `_site/css/`
	config.addPassthroughCopy("src/pretty-atom-feed.xsl");
	config.addPassthroughCopy("src/site.webmanifest");
	config.addPassthroughCopy("src/robots.txt");
	config.addPassthroughCopy("src/assets/images");
	config.addPassthroughCopy("src/assets/fonts");

	// Collections: Posts
	config.addCollection("posts", function (collection) {
		return collection
			.getFilteredByGlob(CONTENT_GLOBS.posts)
			.filter((item) => item.data.permalink !== false)
			.filter((item) => !(item.data.draft && IS_PRODUCTION));
	});

	// Collections: Drafts
	config.addCollection("drafts", function (collection) {
		return collection
			.getFilteredByGlob(CONTENT_GLOBS.drafts)
			.filter((item) => item.data.permalink !== false);
	});

	// Collections: Notes
	config.addCollection("notes", function (collection) {
		return collection.getFilteredByGlob(CONTENT_GLOBS.notes).reverse();
	});

	// Run Eleventy when these files change:
	// https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets

	// Asset Watch Targets

	config.addWatchTarget("./src/assets");

	// Per-page bundles, see https://github.com/11ty/eleventy-plugin-bundle
	// Bundle <style> content and adds a {% css %} paired shortcode
	config.addBundle("css", {
		toFileDirectory: "dist",
		// Add all <style> content to `css` bundle (use eleventy:ignore to opt-out)
		// supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "style",
	});

	// Bundle <script> content and adds a {% js %} paired shortcode
	config.addBundle("js", {
		toFileDirectory: "dist",
		// Add all <script> content to the `js` bundle (use eleventy:ignore to opt-out)
		// supported selectors: https://www.npmjs.com/package/posthtml-match-helper
		bundleHtmlContentFromSelector: "script",
	});

	// Official plugins
	config.addPlugin(pluginSyntaxHighlight, {
		preAttributes: { tabindex: 0 },
	});
	config.addPlugin(pluginNavigation);
	config.addPlugin(HtmlBasePlugin);
	config.addPlugin(InputPathToUrlTransformPlugin);

	config.addShortcode("icon", shortcodes.icon);
	config.addPlugin(feedPlugin, {
		type: "atom", // or "rss", "json"
		outputPath: "/feed.xml",
		stylesheet: "pretty-atom-feed.xsl",
		templateData: {
			eleventyNavigation: {
				key: "besleme",
				order: 5,
			},
		},
		collection: {
			name: "posts",
			limit: 0,
		},
		metadata: {
			language: "en",
			title: "Blog Title",
			subtitle: "This is a longer description about your blog.",
			base: "https://example.com/",
			author: {
				name: "Your Name",
			},
		},
	});

	// Image optimization: https://www.11ty.dev/docs/plugins/image/#eleventy-transform
	/* config.addPlugin(eleventyImageTransformPlugin, {
		// Output formats for each image.
		formats: ["avif", "webp", "auto"],

		// widths: ["auto"],

		failOnError: false,
		htmlOptions: {
			imgAttributes: {
				// e.g. <img loading decoding> assigned on the HTML tag will override these values.
				loading: "lazy",
				decoding: "async",
			},
		},

		sharpOptions: {
			animated: true,
		},
	}); */

	// Filters
	config.addPlugin(pluginFilters);

	// Transforms
	Object.keys(transforms).forEach((transformName) => {
		config.addTransform(transformName, transforms[transformName]);
	});

	config.addPlugin(IdAttributePlugin, {
		// by default we use Eleventy’s built-in `slugify` filter:
		// slugify: config.getFilter("slugify"),
		// selector: "h1,h2,h3,h4,h5,h6", // default
	});

	config.addShortcode("currentBuildDate", () => {
		return new Date().toISOString();
	});

	// Features to make your build faster (when you need them)

	// If your passthrough copy gets heavy and cumbersome, add this line
	// to emulate the file copy on the dev server. Learn more:
	// https://www.11ty.dev/docs/copy/#emulate-passthrough-copy-during-serve

	// config.setServerPassthroughCopyBehavior("passthrough");
}
export const config = {
	// Control which files Eleventy will process
	// e.g.: *.md, *.njk, *.html, *.liquid
	templateFormats: ["njk", "md", "11ty.js"],

	// Pre-process *.md files with: (default: `liquid`)
	markdownTemplateEngine: "njk",

	// Pre-process *.html files with: (default: `liquid`)
	htmlTemplateEngine: "njk",

	// These are all optional:
	dir: {
		input: "src", // default: "."
		output: "dist",
		includes: "includes", // default: "_includes" (`input` relative)
		layouts: "layouts",
		data: "data", // default: "_data" (`input` relative)
	},

	// -----------------------------------------------------------------
	// Optional items:
	// -----------------------------------------------------------------

	// If your site deploys to a subdirectory, change `pathPrefix`.
	// Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

	// When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
	// it will transform any absolute URLs in your HTML to include this
	// folder name and does **not** affect where things go in the output folder.

	// pathPrefix: "/",
};
