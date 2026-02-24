# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Semana da Publicação** - A lead capture landing page targeting medical professionals and students in Brazil. The page promotes a scientific publication course and collects user information through a form that integrates with a webhook endpoint.

**Tech Stack:** Vanilla HTML5, CSS3, JavaScript (ES6+) - No frameworks, no build process.

## Project Structure

```
├── index.html          # Main HTML structure (semantic sections)
├── main.js             # All JavaScript logic (form handling, validation, API)
├── styles.css          # Complete styling (responsive, animations, states)
└── assets/             # Images and media files
    ├── logo.png
    ├── doctor.png
    ├── bg-desktop.png
    ├── bg-mobile.png
    ├── mentor.png
    ├── mentor-bg.png
    ├── aprender-1.png
    ├── notebook.png
    └── final-header.png
```

## Development

**No build process required.** This is a static website that can be opened directly in a browser or served via any static file server.

### Local Development

```bash
# Option 1: Python SimpleHTTPServer
python -m http.server 8000

# Option 2: Node.js http-server (if installed globally)
npx http-server

# Option 3: PHP built-in server
php -S localhost:8000

# Then open: http://localhost:8000
```

### Testing
- **No automated tests** - Manual testing only
- Test form validation by submitting invalid data
- Test responsive layout at mobile breakpoints (900px)
- Test phone input with different country codes
- Verify webhook submission in browser DevTools Network tab

## Architecture Patterns

### JavaScript Architecture (main.js)

**Configuration Object Pattern:**
- All configuration centralized in `CONFIG` object at the top
- Webhook URL, funnel ID, validation rules, redirect URL
- **IMPORTANT:** Update `CONFIG.webhook.url` for production deployments

**State Management:**
- Simple `state` object manages form submission status and phone input instance
- No external state library needed

**Modular Function Design:**
- Each feature isolated in its own function (validation, submission, error handling)
- Functions follow single responsibility principle
- Clear separation: initialization → validation → submission → redirect flow

**Event-Driven:**
- DOMContentLoaded initializes all features
- Real-time validation on `blur` and `input` events
- Form submission with async/await pattern

### Key JavaScript Functions

- `initPhoneInput()` - Configures intl-tel-input library for international phone validation
- `validateField()` - Individual field validation with regex patterns
- `validatePhone()` - Phone number validation using intl-tel-input
- `handleFormSubmit()` - Main form submission flow with error handling
- `sendToWebhook()` - Fetch API call with timeout and AbortController
- `collectFormData()` - Gathers form data + metadata (datetime, page, userAgent, referrer)
- `setLoadingState()` - Manages button loading state during submission
- `trackEvent()` - Analytics helper for Google Analytics and Facebook Pixel

### CSS Architecture (styles.css)

**Structure:**
1. Reset & Base styles
2. Typography
3. Hero section (landing area with form)
4. Form styling (inputs, select, phone field)
5. CTA buttons (multiple variations)
6. Content sections (learning, mentor, final CTA)
7. Media queries (mobile < 900px)
8. State classes (loading, error)

**Responsive Strategy:**
- Desktop-first approach
- Single breakpoint at 900px for mobile
- `clamp()` used for fluid typography
- Background images switch between desktop/mobile variants

**Design Patterns:**
- BEM-like naming (`.learning-card`, `.mentor-section`)
- Utility classes (`.sr-only` for accessibility)
- State modifiers (`.error`, `.loading`)

## Form Flow & Validation

### Validation Rules
- **Name:** Required, minimum 3 characters
- **Email:** Required, regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- **Phone:** Required, validated by intl-tel-input library
- **Education:** Required, must select from dropdown

### Submission Flow
1. Prevent default form submission
2. Validate all fields (show inline errors if invalid)
3. Collect form data + metadata (timestamp, page URL, user agent, referrer)
4. Set loading state (disable button, show spinner)
5. POST to webhook with 10-second timeout
6. On success: Redirect to thank-you page after 500ms delay
7. On error: Show alert, re-enable form, log error to console

### Webhook Integration
- **Endpoint:** Configured in `CONFIG.webhook.url`
- **Method:** POST with JSON payload
- **Timeout:** 10 seconds with AbortController
- **Payload Structure:**
  ```js
  {
    funnel_id: 12,
    datetime: "ISO-8601 timestamp",
    name: "string",
    email: "string",
    phone: "+55XXXXXXXXXX", // Full international format
    education: "string",
    page: "current URL",
    userAgent: "browser string",
    referrer: "previous page or 'direct'"
  }
  ```

## External Dependencies

**Loaded via CDN:**
- **intl-tel-input** (v18.2.1) - International phone number input with country selector and validation
- **Google Fonts** (Ruda family) - Typography in weights 400, 500, 600, 700, 800

**No npm packages** - All dependencies loaded directly in HTML via CDN links.

## Page Sections

1. **Hero Section** - Main landing area with logo, headline, subtitle, and lead capture form
2. **After Hero Bar** - Target audience statement ("Exclusive for doctors and medical students")
3. **Learning Section** - Grid layout showcasing what users will learn (3 cards + CTA)
4. **Mentor Section** - Bio and credentials of Dr. Rhanderson Cardoso
5. **Final CTA** - Last conversion opportunity with visual card and CTA button

**All CTA buttons** scroll to hero section form using `smooth` scroll behavior.

## Important Context

### Language & Audience
- **Language:** Portuguese (Brazil) - pt-BR
- **Target Audience:** Medical professionals and students in Brazil
- **Niche:** Scientific publication and research methodology

### Accessibility Features
- Semantic HTML5 elements (`<section>`, `<article>`, `<nav>`)
- ARIA labels and roles (`aria-label`, `aria-required`, `aria-live`)
- Screen reader only content (`.sr-only` class)
- Keyboard navigation support
- Focus states on interactive elements

### Performance Optimizations
- Preconnect hints for external resources
- Lazy loading for images (`loading="lazy"`)
- Font display swap for web fonts
- Image width/height attributes prevent layout shift

## Configuration Changes

### For Production Deployment
Update these values in `main.js`:

```javascript
const CONFIG = {
  webhook: {
    url: 'YOUR_PRODUCTION_WEBHOOK_URL', // Change this!
    funnelId: 12, // Update if different funnel
    timeout: 10000
  },
  redirect: {
    url: 'YOUR_THANK_YOU_PAGE_URL', // Change this!
    delay: 500
  }
};
```

### Analytics Integration
The code includes hooks for Google Analytics and Facebook Pixel. To activate:
- Add Google Analytics script to `<head>` with `gtag` function
- Add Facebook Pixel script to `<head>` with `fbq` function
- `trackEvent()` function will automatically send events to both platforms

## Common Modifications

### Adding Form Fields
1. Add HTML input in `index.html` form section
2. Add validation logic in `validateField()` function
3. Include field in `collectFormData()` return object
4. Update webhook endpoint to accept new field

### Changing Colors/Branding
- Primary blue: `#3b82c4` → Update in CSS gradients and borders
- Dark blue: `#2f425f` → Update in backgrounds
- Font family: `"Ruda"` → Update Google Fonts link and CSS

### Mobile Breakpoint
Currently set at `900px`. To change, update `@media (max-width: 900px)` in styles.css.

## Known Behavior

- Form submission redirects to external thank-you page
- Phone field requires country code selection (defaults to Brazil)
- Multiple CTAs all scroll to main form in hero section
- Background images different for desktop vs mobile
- No form persistence (data lost on page refresh)
- Client-side validation only (no server-side enforcement visible)
