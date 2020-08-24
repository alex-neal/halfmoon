# halfmoon


I built this e-commerce application for a fictional outdoor gear company in order to refine my full-stack web devolopment skills using Node.js / Express. 

A demo of the application is deployed at https://halfmoondesigns.herokuapp.com/. Feel free to explore the app, create an account, and place a (fake) order!


### Home Page

![homepage](https://user-images.githubusercontent.com/20820910/91080486-42533700-e60b-11ea-9f78-9f7e97632228.png)

<br>

### Product Gallery

![product_gallery](https://user-images.githubusercontent.com/20820910/91080132-afb29800-e60a-11ea-817b-d162244af536.png)

* ***Pagination*** – Navigation links at the bottom of the page allow users to browse multiple pages of products.
* ***Integrated search and filter*** – Users can search for specific keywords with the search bar at the top of the page, which is accessible site-wide. In the product gallery, users can click checkboxes to filter products by category. The check boxes and the search bar are integrated. For example, a user may view all backpacks by clicking the “backpack” checkbox, and then search for the keyword “ultralight” to view all of Half Moon’s ultralight backpacks. Search and filter results are efficiently delivered to the client via AJAX calls.
* ***Administrative Control*** – If an administrative user is signed in, a button appears in the left panel for adding a new product to the database.

<br>

### Product View

![product_view](https://user-images.githubusercontent.com/20820910/91080594-6adb3100-e60b-11ea-9cbc-0bd70a2119ba.png)

* Clicking on a product in the gallery yields the product view. Here, a user can learn more about a product. If the user is signed into an account, the product can also be added to their shopping cart.
* ***Options*** - Currently, the application does not allow for the selection of product options such as size and color. This would be implemented in a future update.
* ***Administrative Controls*** - The above screenshot also shows additional buttons for administrators to edit product details or “soft-delete” the product. These buttons are not visible for normal users.


<br>

### Shopping Cart

![cart](https://user-images.githubusercontent.com/20820910/91080627-7d556a80-e60b-11ea-8d05-a8a5f294f429.png)

* Logged in users can view their shopping cart by clicking the cart icon in the top right- hand corner of the screen.
* ***Cart Update*** – The cart view provides an interface for modifying item quantities or deleting items from the cart. If a quantity is increased, a query to the database is made to confirm that enough inventory is available. If so, that quantity is reserved for the user. Similarly, if the user decreases a quantity or deletes an item, the corresponding quantity is returned to inventory in the Half Moon product database.
* ***Subtotal*** – Users can view the current calculated subtotal for their cart.
* Users may continue shopping or proceed to checkout by clicking the checkout button.

<br>

### Checkout

![checkout](https://user-images.githubusercontent.com/20820910/91080686-96f6b200-e60b-11ea-9e9e-73cc2ca0d74f.png)

* On the checkout page, a logged in user can enter their shipping address and view the complete pricing details for the order.
* ***Payment*** – Payment details and processing are disabled.
* ***Shipping*** – Free for all orders.
* ***Placing an Order*** – After entering a shipping address, the user can click the “Place Order” button to complete the order. At that point, the order is added to the database and the user’s shopping cart is reset.
* ***View Past Orders*** – The application also allows users to view the specific details of their order history.

<br>

## TO-DO
Future updates could include:


* Support for users who do not wish to create an account, such as the ability to place items into a (temporary) shopping cart and place an order as a guest.
* Support for product options such as size and color selection
* Payment processing
* Saving of user addresses and credit cards to expedite the ordering process
* The ability for users to modify their account details (name, email, password, addresses). Currently, only a delete account feature is implemented.
* The ability for users to retrieve a forgotten password


## Database Design 

The application connects to a MongoDB database. For the data model, necessary entities are organized into three separate collections: Products, Users, and Orders.

### Products 
Products are identified by a unique ‘_id’ field. Each field contains information specific to the product; there are no foreign keys. The ‘deleted’ field implements a soft-delete feature (products where ‘deleted’ = true are not delivered to the client during product browsing). In order to keep the data model simple, we assume that there are no selectable options (e.g. size, color) for any product.

![products](https://user-images.githubusercontent.com/20820910/91082778-c78c1b00-e60e-11ea-9297-982b495a1ce5.png)

<br>

### Users 
Users are identified by a unique ‘_id’ field as well as a unique ‘email’ field. The salted and hashed password is stored in the ‘password’ field. Since shopping carts and users have a simple one-to-one relationship, the cart can be well-represented as an embedded document in the user collection. This document is an array of objects, each including a ‘productId’ field (which is a foreign key to the corresponding product in the Product collection) and a ‘quantity’ field.

![users](https://user-images.githubusercontent.com/20820910/91082808-d4a90a00-e60e-11ea-9af4-18508df94652.png)

<br>

### Orders 
Orders are identified by a unique ‘_id’ field. They also include a ‘userId’ field, which is a foreign key representing the unique ID of the user that placed the order. This collection also includes an embedded document ‘items’, which has the same structure as the ‘cart’ field in the User collection. When an order is placed, order.items is assigned the value of user.cart, and then user.cart is reset to an empty array. 

![orders](https://user-images.githubusercontent.com/20820910/91082834-e25e8f80-e60e-11ea-9b6c-977ba7829b98.png)

<br>

## Languages, Frameworks, Packages 

The front-end development languages are HTML, CSS, and JavaScript. Additional front-end technologies include:

* Bootstrap CSS framework v Font Awesome icons
* JQuery JavaScript library

The back-end development language is JavaScript via the Node.js runtime environment. The framework used is Express, and the template engine is EJS. Several Node packages are used, including:
* *Monk* – for MongoDB interface
* *Bcrypt* – for salting and hashing passwords prior to database storage v Multer – for image file upload
* *Session* – for maintaining user session data
* *Method-Override* – to allow the delete and put HTTP request methods.
* *DotEnv* - For setting environment variables
