# Student Portfolio

A responsive, no-build static portfolio made with HTML, CSS, and a small amount of JavaScript. It is designed to publish from GitHub Pages and uses relative paths so it works as either a user site or a repository project site.

## Publish with GitHub Pages

1. Push this folder to a GitHub repository on the `main` branch.
2. In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source.
3. The workflow in `.github/workflows/pages.yml` publishes the site after each push to `main`. You can also start a run from the **Actions** tab.

The first deployment URL appears in the Pages environment in the workflow run. A user site usually uses `https://<username>.github.io`; a project site usually uses `https://<username>.github.io/<repository>/`.

## Personalize before publishing

- Replace the generic page title and introductory copy with details the student is comfortable sharing.
- Add a GitHub profile link only after confirming the correct public URL.
- Add project links, video, tools, and responsibilities only after confirming what is public and accurate.
- Keep phone numbers, home address, student IDs, private school records, and account credentials off the public site. The current page omits direct contact details.

The page has no server, form, or analytics service. It respects the device's reduced-motion preference and retains a solid background if glass blur is unavailable.
