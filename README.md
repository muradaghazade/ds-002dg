# A little date? ♡

A pink invitation for GitHub Pages. The guest chooses cinema, food, or coffee, fills in the corresponding detail, and picks a date. The owner opens `admin/` to view replies and click through to each reply’s detail page.

## Try it locally

Run `python3 -m http.server 8000` from this directory and open `http://localhost:8000/`. With both settings in `config.js` empty, the site saves replies in your browser. Send a sample reply, then open `http://localhost:8000/admin/` in the same browser and tab profile to view it.

## Collect real replies

1. Create a [Supabase project](https://supabase.com/dashboard). Under **Authentication → Users**, create and confirm your owner account with an email and password. Copy its User UID. You can turn off public signups in Authentication settings.
2. Open [setup.sql](setup.sql) and replace the all-zero UUID in the read policy with your owner User UID. Run the SQL in your project’s SQL Editor. The script can be rerun without deleting replies.
3. In [config.js](config.js), set your project URL and its [publishable key](https://supabase.com/docs/guides/getting-started/api-keys). Keep your password and privileged Supabase keys out of the repository.
4. Put the contents of this directory, including `.nojekyll` and `admin/`, at the root of a GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, select your branch and **/(root)**, then save. [GitHub Pages setup](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
5. Send the Pages URL to your girlfriend. Open that URL with `admin/` appended and sign in to see responses. Submit a sample reply from a different browser or device before sharing the link.

Anyone who has the invitation URL can send a reply. Supabase authorizes reading replies only for your designated owner account. Locally saved data stays in the browser where it was entered.

## Edit the invitation

Change the wording in [index.html](index.html) and the activity options in [options.js](options.js). The 30 coffee-shop choices are based on [Pulled’s Baku directory](https://www.pulled.coffee/city/baku/specialty), [World Coffee Map’s Baku guide](https://worldcoffeemap.com/guides/best-cafes-in-baku), [Nodik’s Baku café listings](https://nodik.dev/places/az/baku/cafe/), [United Coffee Beans](https://www.ucb.az/en/locations), [Second Cup Azerbaijan](https://www.mysecondcup.com/azerbaijan/), [Port Baku Mall](https://portbakumall.az/?hl=en), and [ABB’s merchant listing](https://cdn.abb-bank.az/QR_HESABAT_2f92c97ae0.pdf). For cuisines, see the [Baku restaurant directory](https://bakurestaurants.az/en).

Cinema cards use the November 18, 2026 snapshot of [CineMastercard’s Today listings](https://cinemastercard.az/en/), with posters served by CineMastercard. Edit [movies.js](movies.js) to update the titles and poster URLs. Guests can also type a different film.
