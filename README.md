# Careflow Clinic Workspace

A responsive frontend demo for patient intake, keyword-based triage suggestions, care-team coordination, visit summaries, and medicine reminder details.

## Run locally

```sh
npm install
npm run dev
```

## Build and deploy

```sh
npm run build
npm run preview
```

The production site is written to `dist/`. Deploy that directory to any static hosting provider, such as GitHub Pages, Netlify, or Vercel. The app uses relative asset paths and does not require a server or environment variables.

## Demo limitations

Patient records are saved in the current browser's local storage and are not synchronized to a server. The triage summary is a basic keyword demonstration, not an AI model or a medical diagnosis. Reminder details are stored locally; this demo does not deliver background notifications. Do not enter real patient information or use this app for clinical decisions or emergencies.