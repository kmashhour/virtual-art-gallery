# React Crash Course

This guide documents the **exact steps** needed to follow the React
Crash Course:\
https://youtu.be/LDB4uaJ87e0?si=t5u_DKu5nO38ONtR

Tailwind v4 (2025) no longer generates a config file and uses a
different setup, so this guide ensures compatibility with the course.

------------------------------------------------------------------------

## 🎯 Goal

Set up a React project using **Vite**, then install **TailwindCSS v3**
so that everything shown in the tutorial matches.

------------------------------------------------------------------------

## 📌 1. Create a React Project (Vite)

**Timestamp: 19:50 in the video**

In your terminal:

``` bash
npm create vite@latest your-project-name
```

Then: 1. Enter your **project name** 2. Choose **React** 3. Choose
**JavaScript**

This command also creates the project folder.

Install dependencies:

``` bash
cd your-project-name
npm install
```

------------------------------------------------------------------------

## 📌 2. Install TailwindCSS v3 (Required for the 2024 course)

**Timestamp: 26:50 in the video**

Because Tailwind v4 is now the default but the course uses v3, install
the correct version manually:

``` bash
npm install -D tailwindcss@3.4.1 postcss autoprefixer
```

Generate the config files:

``` bash
npx tailwindcss init -p
```

This creates: - `tailwind.config.js` - `postcss.config.js`

------------------------------------------------------------------------

## 📌 3. Configure `tailwind.config.js`

Replace the content section with:

``` js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

This ensures Tailwind scans your React components.

------------------------------------------------------------------------

## 📌 4. Add Tailwind directives to your CSS

In `src/index.css`, add:

``` css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

⚠️ **Note:**\
Some Vite templates create an empty `index.css`.\
This is normal --- simply add the three Tailwind lines manually.

------------------------------------------------------------------------

## 📌 5. Enable Tailwind Mode in VS Code (Fix @tailwind warnings)

To unlock hover previews, autocomplete, and remove the "Unknown at rule
@tailwind" underline:

1.  Open `src/index.css`
2.  Look at the bottom right of VS Code (language mode)
3.  Click `CSS`
4.  Switch to **Tailwind CSS**

```

This makes all `.css` files open in Tailwind mode and enables
autocomplete inside `"className"` strings.

------------------------------------------------------------------------

## 📌 6. Test Tailwind

Start the dev server:

``` bash
npm run dev
```

In `App.jsx`, try:

``` jsx
<h1 className="text-3xl font-bold underline">
  Tailwind is working!
</h1>
```

If you see a large, underlined heading --- you're ready to continue the
course.

------------------------------------------------------------------------