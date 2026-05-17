# SmartBookStore

SmartBookStore is a responsive online bookstore website built with HTML, CSS, and JavaScript. It allows users to browse books, search and filter the catalog, save books to a wishlist, add books to a cart, checkout, and view invoice purchase history.

## Main Features

- Responsive dark-mode bookstore interface with Light Mode available in the accessibility panel.
- Home page with promotion carousel, search, trending books, recommended books, and popular categories.
- Books page with category filter, sorting, keyword search, search button, recommendations, and empty-state guidance.
- Book detail page with selected book information and add-to-cart action.
- Wishlist page using `localStorage` to save books between visits.
- Cart page with quantity controls, remove buttons, checkout form, voucher support, and validation.
- Invoice page with order confirmation, payment summary, tracking details, billing/shipping address, purchase history, and clear-history button.
- Accessibility tools for text size, contrast, Light Mode, underlined links, readable font, grayscale, and negative mode.

## Pages

```text
index.html      Home page
books.html      Full book catalog, search, filters, and sorting
detail.html     Selected book detail page
cart.html       Shopping cart and checkout form
invoice.html    Invoice, tracking, purchase history, and order confirmation
wishlist.html   Saved books
about.html      Store and team information
```

## Folder Structure

```text
Project-WebTech/
|-- index.html
|-- books.html
|-- detail.html
|-- cart.html
|-- invoice.html
|-- wishlist.html
|-- about.html
|-- README.md
|-- data/
|   `-- books.json
`-- assets/
    |-- css/
    |   `-- main.css
    |-- images/
    |   |-- logo.png
    |   |-- akmal.jpeg
    |   |-- alip.jpeg
    |   |-- azfar.jpeg
    |   `-- hafiz.jpeg
    `-- js/
        |-- accessibility.js
        |-- cart.js
        |-- catalog.js
        |-- config.js
        |-- detail.js
        |-- invoice.js
        |-- main.js
        |-- nav.js
        |-- promotions.js
        |-- storage.js
        |-- utils.js
        `-- wishlist.js
```

## JavaScript Structure

- `main.js` is the shared entry point used by every page.
- `catalog.js` loads book data, renders book cards, handles search, category filtering, sorting, recommendations, and Open Library API results.
- `cart.js` manages cart items, quantity changes, vouchers, checkout validation, order creation, and EmailJS receipt sending.
- `invoice.js` displays the order confirmation, invoice details, tracking timeline, purchase history, and clear-history action.
- `storage.js` centralizes all `localStorage` access for cart, wishlist, selected book, last order, and order history.
- `wishlist.js` handles saving, removing, and moving wishlist books to cart.
- `detail.js` renders the selected book detail.
- `promotions.js` controls the home page promotion carousel.
- `accessibility.js` creates the accessibility panel and applies visual settings.
- `utils.js` contains shared helper functions such as price formatting, HTML escaping, visibility control, and toast messages.

## API, AJAX, and JSON Usage

This project uses both local JSON and an external API.

- Local JSON catalog: `data/books.json`
- AJAX/data loading: `fetch()` loads the local JSON file.
- External API: Open Library Search API is used to load extra book results and search suggestions.
- Cover API: Open Library cover URLs are used for many book cover images.
- Browser APIs: `localStorage`, `fetch`, `setTimeout`, `URLSearchParams`, and DOM events.
- Email API: EmailJS is used to send customer receipts and owner order notifications after checkout.

## Search, Filter, and Sort

The Books page supports:

- Search by title, author, or category.
- Magnifier search button and Enter-to-search.
- Category filtering.
- Sorting by featured, best selling, A-Z, Z-A, price low-high, price high-low, newest, and oldest.
- Empty-state message with a clear filters action.

## Cart and Invoice Flow

1. User adds books to cart.
2. User changes quantity or removes items if needed.
3. User fills checkout form and chooses payment method.
4. User can apply vouchers such as `BOOK10`, `MAY20`, or `FREESHIP`.
5. After placing an order, the site saves the invoice to purchase history.
6. Invoice page shows a thank-you confirmation, tracking details, payment summary, and address information.
7. User can revisit previous invoices from Purchase History or clear all history.

## Accessibility and Responsiveness

- The layout adapts for desktop, tablet, and mobile screens.
- Book grids, cart layout, invoice layout, navigation, and tables are responsive.
- Dark mode is the default theme.
- Light Mode can be enabled from the accessibility panel.
- Accessibility panel includes text resizing, contrast, grayscale, negative mode, underlined links, and readable font.
- Form fields include labels, and images include meaningful alternative text where rendered dynamically.

## Run Locally

Use a local server because the catalog is loaded with `fetch()` from `data/books.json`.

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```

## Suggested Demo Flow

1. Open the Home page and show dark mode, promotion carousel, search, and categories.
2. Go to Books and demonstrate search, filters, sorting, and responsive book cards.
3. Save a book to Wishlist.
4. Add books to Cart and apply a voucher.
5. Checkout and show the thank-you confirmation on Invoice.
6. Show Purchase History and clear-history button.
7. Open Accessibility and switch to Light Mode.
