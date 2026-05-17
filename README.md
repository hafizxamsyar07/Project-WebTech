# SmartBookStore

SmartBookStore is a static HTML, CSS, and JavaScript bookstore project. The codebase has been reorganized so each file has one clear responsibility.

## Folder Structure

```text
Project-WebTech/
├── index.html
├── books.html
├── detail.html
├── cart.html
├── invoice.html
├── wishlist.html
├── about.html
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── images/
│   │   ├── akmal.jpeg
│   │   ├── alip.jpeg
│   │   ├── azfar.jpeg
│   │   └── hafiz.jpeg
│   └── js/
│       ├── accessibility.js
│       ├── cart.js
│       ├── catalog.js
│       ├── config.js
│       ├── detail.js
│       ├── invoice.js
│       ├── main.js
│       ├── nav.js
│       ├── promotions.js
│       ├── storage.js
│       ├── utils.js
│       └── wishlist.js
└── data/
    └── books.json
```

## Code Architecture

- `assets/js/main.js` is the single app entry point.
- `assets/js/catalog.js` handles JSON catalog loading, API search via Open Library, filters, sorting, cards, and categories.
- `assets/js/cart.js` handles cart storage, quantity controls, promo vouchers, checkout, and EmailJS receipts.
- `assets/js/invoice.js` renders the latest order invoice, tracking details, and address summary.
- `assets/js/promotions.js` controls the home page promotion carousel.
- `assets/js/wishlist.js` handles saved books and wishlist page rendering.
- `assets/js/detail.js` renders the selected book detail page.
- `assets/js/storage.js` centralizes all `localStorage` usage.
- `assets/js/utils.js` keeps shared helpers such as price formatting, escaping HTML, and toast messages.
- `assets/css/main.css` replaces the old duplicate CSS files.

## Run Locally

Use a local server because the catalog is loaded from `data/books.json`.

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500
```
