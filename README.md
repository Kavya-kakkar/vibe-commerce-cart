# Vibe Commerce Cart

A full-stack mock e-commerce cart web app built with React, Node.js/Express, and MongoDB Atlas.

---

## Features

- Browse products with images, names, and prices
- Add products to cart, update quantities, remove items
- Simple checkout workflow with total calculation
- Backend with Express and MongoDB Atlas for data persistence
- Frontend with React for seamless UI experience

---

## Tech Stack

- Frontend: React, Axios, CSS
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas

---

## Setup Instructions

### Backend

1. Clone the repo:
    ```
    git clone <your-repo-url>
    cd <repo>/backend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Update your MongoDB Atlas connection URI in `app.js`.
4. Start backend server:
    ```
    node app.js
    ```

### Frontend

1. Navigate to frontend:
    ```
    cd ../frontend
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Start frontend:
    ```
    npm start
    ```

---

## MongoDB Atlas Setup

- Create a free MongoDB Atlas cluster.
- Add IP whitelist or allow access from anywhere during development.
- Create users and get connection string.
- Ensure backend connection string matches your cluster.

---


## Demo Video

Watch the demo: [Demo Link](https://www.loom.com/share/c508d019bbd7482ebec35a65684c7749)

---

## Troubleshooting

- Make sure MongoDB Atlas IP whitelist includes your current IP.
- Restart backend after editing environment or connection configs.
- Check browser console for frontend errors.

---

## License

MIT License

---

Enjoy exploring the project! Feel free to ask if you get stuck.

