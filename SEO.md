# SEO and indexing checklist

Live site: https://cohort-trafy.vercel.app  (canonical URLs, sitemap.xml and JSON-LD all use this host)

If you move to a custom domain, replace `https://cohort-trafy.vercel.app` with the new domain in every `.html` file,
`sitemap.xml` and `robots.txt`, then redeploy and re-submit the sitemap.

## Get indexed (cannot be done from code, 10 minutes)
1. Google Search Console: add the property (URL prefix), verify, then Sitemaps > submit `sitemap.xml`.
   Use URL Inspection > Request indexing on the home page, Employability Index, Startup and Journal pages.
2. Bing Webmaster Tools: import the site from Search Console. Bing also feeds DuckDuckGo, Yahoo and others.
3. IndexNow (Bing, Yandex, Seznam): optional; add a key file and ping https://api.indexnow.org/indexnow.
4. Link to the page from places crawlers already visit: trafy.si, LinkedIn, Instagram, YouTube descriptions, GitHub repo "website" field.
5. Re-check in 1-2 weeks: search `site:cohort-trafy.vercel.app` on Google.

## Already done in the code
Unique title and meta description per page, canonical, Open Graph and Twitter cards, robots meta,
JSON-LD (Organization, WebSite, Course, FAQPage on the home page; Article, BreadcrumbList on inner pages),
sitemap.xml, robots.txt with the sitemap, 24 FAQs, one H1 per page, alt text on images, clean URLs.
