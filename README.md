# QuickCart - Shopping Cart Application

QuickCart is a React-based shopping cart application that allows users to browse products, add them to their cart, and manage their cart using Firebase for user authentication and Firestore for storing cart data. The app features a modern, interactive UI with notifications and cart total calculations.

## Features

- **Product List**: Fetches and displays a list of products from Firebase Firestore.
- **Product Details**: When a user clicks on a product, a popup appears showing detailed information.
- **Add to Cart**: Users can add products to their cart, which is saved in Firebase Firestore.
- **User Authentication**: Users must be logged in to add items to their cart.
- **Cart Management**: The cart is saved in the Firebase Firestore, and users can see the products they added.
- **Cart Total Calculation**: Automatically calculates and updates the total price of the items in the cart.
- **Alerts**: SweetAlert2 popups notify the user when an item is added to the cart or if the user is not logged in.

## Tech Stack

- **React**: JavaScript library for building the user interface.
- **Firebase**: Used for authentication (Firebase Auth) and storing cart data (Firestore).
- **SweetAlert2**: For showing custom alerts.
- **CSS**: Custom styling for the application.
