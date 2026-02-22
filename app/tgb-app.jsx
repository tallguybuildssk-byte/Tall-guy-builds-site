"The logo error is fixed on the main website, but the app still shows the blue error screen with <div> <body> <html> text.

Please:

Check the app code (the React app component - tgb-app.jsx or similar)
Make sure it's using the SAME logo path as the main website
Find where LogoMark is being used in the app and fix the logo reference there too
Test the app in the browser to make sure it loads without errors
Make sure the logo displays correctly in the login screen, headers, and client portal"