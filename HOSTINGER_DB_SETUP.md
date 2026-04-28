# Hostinger Database Setup

Use `.env.local` like this:

```env
DB_HOST=your-hostinger-db-host
DB_PORT=your-hostinger-db-port
DB_USER=your-hostinger-db-user
DB_PASSWORD=your-hostinger-db-password
DB_NAME=your-hostinger-db-name
PRODUCT_UPLOADS_PATH=public/uploads/products
```

Create this MySQL table on Hostinger:

```sql
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('Fish', 'Birds', 'Accessories') NOT NULL,
  subcategory VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2) NULL,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(255) NOT NULL UNIQUE,
  image TEXT NOT NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

How it works:

1. Admin uploads product image
2. Image is saved in `public/uploads/products`
3. Product details are saved in Hostinger MySQL
4. User pages read products from the database

If DB env values are missing, the app falls back to local demo mode.
