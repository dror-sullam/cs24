# CS24 Site

A comprehensive resource website for students at HIT (Holon Institute of Technology), featuring course materials, tutors, and more.

## Features

- Course materials organized by year and degree (CS/EE)
- Tutor listings with contact information and reviews
- Admin panel for managing tutor requests
- Specialization filtering for EE courses
- Job postings for CS and EE students

## Tech Stack

- React
- Create React App
- Tailwind CSS
- Supabase (Authentication & Database)

## Deployment Instructions

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- GitHub account
- Netlify account

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/cs24-site.git
   cd cs24-site
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example` and fill in your Supabase credentials:
   ```
   REACT_APP_SUPABASE_URL=your-supabase-url
   REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
   REACT_APP_ADMIN_EMAIL_1=your-admin-email
   ```

4. Start the development server:
   ```
   npm start
   ```

### Deploying to Netlify

1. Push your code to GitHub:
   ```
   git add .
   git commit -m "Ready for production"
   git push
   ```

2. Log in to Netlify and create a new site from your GitHub repository.

3. In the Netlify site settings, add the following environment variables:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
   - `REACT_APP_ADMIN_EMAIL_1` (and others as needed)

4. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build` (not dist, since this is Create React App)

5. Deploy the site.

## Security Considerations

- Never commit `.env` files or any files containing sensitive information
- Use environment variables for all sensitive data
- Set up proper Row Level Security (RLS) in Supabase
- Regularly rotate your API keys

## License

MIT

## Environment Setup

Before running the project, you need to set up your environment variables:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in the `.env` file:
   - `REACT_APP_SUPABASE_URL`: Your Supabase project URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `REACT_APP_ADMIN_EMAIL`: Admin email address for managing tutor requests

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Make sure to set up the same environment variables in your deployment platform (e.g., Netlify, Vercel).

## Security Notes

- Never commit the `.env` file to version control
- Keep your Supabase keys secure
- Regularly rotate your API keys
- Use environment variables for all sensitive data

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
