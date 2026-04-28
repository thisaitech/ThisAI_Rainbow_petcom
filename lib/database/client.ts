import mysql from 'mysql2/promise'
import { databaseEnv, hasDatabaseEnv } from '@/lib/database/config'

let pool: mysql.Pool | null = null

export const getDatabasePool = () => {
  if (!hasDatabaseEnv) {
    throw new Error('Database environment variables are not configured.')
  }

  if (!pool) {
    pool = mysql.createPool({
      host: databaseEnv.host,
      port: Number(databaseEnv.port),
      user: databaseEnv.user,
      password: databaseEnv.password,
      database: databaseEnv.name,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    })
  }

  return pool
}
