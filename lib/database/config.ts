export const databaseEnv = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME,
  uploadsBasePath: process.env.PRODUCT_UPLOADS_PATH || 'public/uploads/products',
}

const isPlaceholder = (value?: string) => {
  if (!value) return true

  return (
    value.includes('your-hostinger-db-host') ||
    value.includes('your-hostinger-db-port') ||
    value.includes('your-hostinger-db-user') ||
    value.includes('your-hostinger-db-password') ||
    value.includes('your-hostinger-db-name')
  )
}

export const hasDatabaseEnv = Boolean(
  databaseEnv.host &&
    databaseEnv.port &&
    databaseEnv.user &&
    databaseEnv.password &&
    databaseEnv.name &&
    !isPlaceholder(databaseEnv.host) &&
    !isPlaceholder(databaseEnv.port) &&
    !isPlaceholder(databaseEnv.user) &&
    !isPlaceholder(databaseEnv.password) &&
    !isPlaceholder(databaseEnv.name)
)
