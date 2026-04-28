import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import { databaseEnv } from '@/lib/database/config'

const sanitizeFileName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-')

const resolveUploadsDir = () => path.join(process.cwd(), databaseEnv.uploadsBasePath)

export const saveProductImage = async (file: File) => {
  const uploadsDir = resolveUploadsDir()
  await mkdir(uploadsDir, { recursive: true })

  const fileName = `${Date.now()}-${randomUUID()}-${sanitizeFileName(file.name || 'product-image')}`
  const absolutePath = path.join(uploadsDir, fileName)
  const buffer = Buffer.from(await file.arrayBuffer())

  await writeFile(absolutePath, buffer)

  return {
    filePath: absolutePath,
    publicUrl: `/uploads/products/${fileName}`,
  }
}

export const deleteProductImageByUrl = async (imageUrl?: string | null) => {
  if (!imageUrl) {
    return
  }

  if (!imageUrl.startsWith('/uploads/products/')) {
    return
  }

  const absolutePath = path.join(process.cwd(), 'public', imageUrl.replace(/^\//, ''))
  await unlink(absolutePath).catch(() => undefined)
}
