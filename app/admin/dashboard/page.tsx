'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCart, Package, Users, DollarSign, 
  TrendingUp, Eye, ChevronDown, LogOut, 
  PawPrint, RefreshCw, Search, Filter,
  CheckCircle, Clock, Truck, XCircle, ArrowRight, UserCircle,
  Plus, Pencil, Trash2, X, Save
} from 'lucide-react'
import { useAuthStore, Order, UserCart } from '@/store/useAuthStore'
import { formatPrice } from '@/lib/utils'
import { AdminProduct, useAdminProductStore } from '@/store/useAdminProductStore'
import Link from 'next/link'
import Image from 'next/image'

type ProductFormState = {
  name: string
  category: 'Fish' | 'Birds' | 'Accessories'
  productType: 'live-fish' | 'fish-food' | 'single-item'
  price: string
  stock: string
  featured: boolean
  optionGroupLabel: string
  optionValuesText: string
}

const emptyProductForm: ProductFormState = {
  name: '',
  category: 'Fish',
  productType: 'live-fish',
  price: '',
  stock: '',
  featured: false,
  optionGroupLabel: 'Pack Size',
  optionValuesText: '1 Fish, 2 Fish, 3 Fish, 4 Fish',
}

const productTypeMeta: Record<
  ProductFormState['productType'],
  { label: string; optionGroupLabel?: string; optionValues: string[]; description: string }
> = {
  'live-fish': {
    label: 'Live Fish',
    optionGroupLabel: 'Pack Size',
    optionValues: ['1 Fish', '2 Fish', '3 Fish', '4 Fish'],
    description: 'Customers can choose how many fish they want to buy.',
  },
  'fish-food': {
    label: 'Fish Food',
    optionGroupLabel: 'Weight',
    optionValues: ['100 gm', '200 gm', '500 gm', '1 kg'],
    description: 'Customers can choose the food pack weight.',
  },
  'single-item': {
    label: 'Single Item',
    optionValues: [],
    description: 'This product has no extra selectable option.',
  },
}

const getProductTypeMeta = (productType?: AdminProduct['productType']) =>
  productTypeMeta[productType ?? 'live-fish'] ?? productTypeMeta['live-fish']

const getDefaultOptionState = (productType: ProductFormState['productType']) => {
  const meta = productTypeMeta[productType]

  return {
    optionGroupLabel: meta.optionGroupLabel ?? '',
    optionValuesText: meta.optionValues.join(', '),
  }
}

const generateSku = (name: string, productType: ProductFormState['productType']) => {
  const normalizedName = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 20)

  const typeCode =
    productType === 'live-fish' ? 'FISH' : productType === 'fish-food' ? 'FOOD' : 'ITEM'

  return `${typeCode}-${normalizedName || 'PRODUCT'}`
}

const getDerivedSubcategory = (
  category: ProductFormState['category'],
  productType: ProductFormState['productType']
) => {
  if (productType === 'fish-food') return 'Fish Food'
  if (productType === 'live-fish') return category === 'Birds' ? 'Bird' : 'Live Fish'
  return category
}

const statusColors: Record<AdminProduct['status'], string> = {
  Active: 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-700',
}

const compressImageFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const img = new window.Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 480
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))

        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('Failed to process the selected image.'))
          return
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }

      img.onerror = () => reject(new Error('Failed to process the selected image.'))
      img.src = String(reader.result || '')
    }

    reader.onerror = () => reject(new Error('Failed to read the selected image.'))
    reader.readAsDataURL(file)
  })

export default function AdminDashboard() {
  const router = useRouter()
  const { 
    currentUser, 
    isAuthenticated, 
    logout, 
    getAllUserCarts, 
    getAllOrders,
    updateOrderStatus,
    users,
    switchAccount
  } = useAuthStore()
  const { products, setProducts, upsertProduct, addProduct, updateProduct, removeProduct } = useAdminProductStore()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'carts' | 'users'>('overview')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null)
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all')
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm)
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState('')
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isSyncingProducts, setIsSyncingProducts] = useState(false)
  const [isImportingCatalog, setIsImportingCatalog] = useState(false)
  const [isDatabaseConfigured, setIsDatabaseConfigured] = useState(false)
  const [productMessage, setProductMessage] = useState('')
  const [productError, setProductError] = useState('')

  // Protect route
  useEffect(() => {
    if (!isAuthenticated || (currentUser?.role !== 'admin' && currentUser?.role !== 'owner')) {
      router.push('/admin/login')
    }
  }, [isAuthenticated, currentUser, router])

  const resetProductEditor = () => {
    setEditingProduct(null)
    setProductForm(emptyProductForm)
    setProductImageFile(null)
    setProductImagePreview('')
    setProductError('')
  }

  const updateProductForm = (updates: Partial<ProductFormState>) => {
    setProductError('')
    setProductForm((prev) => ({ ...prev, ...updates }))
  }

  const syncProductsFromDatabase = async () => {
    setIsSyncingProducts(true)
    setProductError('')

    try {
      const response = await fetch('/api/products', { cache: 'no-store' })
      const data = (await response.json()) as {
        products?: AdminProduct[]
        configured?: boolean
        message?: string
      }

      if (!response.ok) {
        setIsDatabaseConfigured(false)
        if (data.message) {
          setProductMessage('Demo mode active. Products save locally in this browser.')
        }
        return
      }

      if (data.configured === false) {
        setIsDatabaseConfigured(false)
        setProductMessage(data.message || 'Demo mode active. Products save locally in this browser.')
        return
      }

      setProducts(data.products ?? [])
      setIsDatabaseConfigured(Boolean(data.configured))
      setProductMessage('Live database catalog is connected.')
    } catch {
      setIsDatabaseConfigured(false)
      setProductMessage('Demo mode active. Products are saving locally in this browser.')
    } finally {
      setIsSyncingProducts(false)
    }
  }

  useEffect(() => {
    void syncProductsFromDatabase()
  }, [])

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
    return null
  }

  const orders = getAllOrders()
  const userCarts = getAllUserCarts()

  // Stats
  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalOrders = orders.length
  const activeUsers = users.filter(u => u.role === 'user').length

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getProductTypeMeta(product.productType).label.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter
    return matchesSearch && matchesCategory
  })

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'processing': return 'bg-purple-100 text-purple-700'
      case 'shipped': return 'bg-indigo-100 text-indigo-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'confirmed': return <CheckCircle className="w-4 h-4" />
      case 'processing': return <RefreshCw className="w-4 h-4" />
      case 'shipped': return <Truck className="w-4 h-4" />
      case 'delivered': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return null
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const openCreateProduct = () => {
    resetProductEditor()
    setShowProductForm(true)
  }

  const openEditProduct = (product: AdminProduct) => {
    setEditingProduct(product)
    setProductImageFile(null)
    setProductImagePreview(product.image)
    setProductError('')
    setProductForm({
      name: product.name,
      category: product.category,
      productType: product.productType,
      price: String(product.price),
      stock: String(product.stock),
      featured: product.featured,
      optionGroupLabel: product.optionGroupLabel || '',
      optionValuesText: product.optionValues?.join(', ') || '',
    })
    setShowProductForm(true)
  }

  const handleSaveProduct = async () => {
    const hasImage = Boolean(productImageFile || productImagePreview)

    if (!productForm.name || !productForm.price || !productForm.stock || !hasImage) {
      setProductError('Please complete the product name, price, stock, and image.')
      return
    }

    const productMeta = productTypeMeta[productForm.productType]
    const customOptionValues = productForm.optionValuesText
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const optionValues =
      productForm.productType === 'single-item'
        ? []
        : customOptionValues.length > 0
          ? customOptionValues
          : productMeta.optionValues
    const generatedSku = generateSku(productForm.name, productForm.productType)
    const generatedSubcategory = getDerivedSubcategory(productForm.category, productForm.productType)
    const generatedDescription = `${productForm.name} from the ${productForm.category} catalog.`

    const payload = {
      name: productForm.name,
      category: productForm.category,
      productType: productForm.productType,
      optionGroupLabel:
        productForm.productType === 'single-item'
          ? undefined
          : (productForm.optionGroupLabel.trim() || productMeta.optionGroupLabel),
      optionValues,
      subcategory: generatedSubcategory,
      description: generatedDescription,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      sku: generatedSku,
      image: productImagePreview,
      featured: productForm.featured,
    }

    setIsSavingProduct(true)
    setProductError('')

    const formData = new FormData()
    formData.set('name', payload.name)
    formData.set('category', payload.category)
    formData.set('subcategory', payload.subcategory)
    formData.set('description', payload.description)
    formData.set('price', String(payload.price))
    formData.set('stock', String(payload.stock))
    formData.set('sku', payload.sku)
    formData.set('image', payload.image)
    formData.set('featured', String(payload.featured))
    formData.set('previousImage', editingProduct?.image || '')

    if (productImageFile) {
      formData.set('imageFile', productImageFile)
    }

    try {
      const response = await fetch(
        editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products',
        {
          method: editingProduct ? 'PUT' : 'POST',
          body: formData,
        }
      )

      const data = (await response.json()) as {
        product?: AdminProduct
        message?: string
      }

      if (!response.ok || !data.product) {
        throw new Error(data.message || 'Failed to save product to database.')
      }

      upsertProduct(data.product)
      setIsDatabaseConfigured(true)
      setProductMessage(data.message || 'Product saved successfully.')
      setShowProductForm(false)
      resetProductEditor()
      return
    } catch (error) {
      let localImage = productImagePreview || payload.image

      if (productImageFile) {
        try {
          localImage = await compressImageFile(productImageFile)
        } catch (imageError) {
          setProductError(
            imageError instanceof Error ? imageError.message : 'Failed to process the selected image.'
          )
          setIsSavingProduct(false)
          return
        }
      }

      const localPayload = {
        ...payload,
        image: localImage,
      }

      if (editingProduct) {
        updateProduct(editingProduct.id, localPayload)
      } else {
        addProduct(localPayload)
      }

      setProductMessage(
        'Saved locally in demo mode.'
      )
      setShowProductForm(false)
      resetProductEditor()
    } finally {
      setIsSavingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return

    try {
      if (isDatabaseConfigured) {
        const response = await fetch(`/api/admin/products/${productId}`, {
          method: 'DELETE',
        })
        const data = (await response.json()) as { message?: string }

        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete product from database.')
        }
      }
    } catch (error) {
      setProductMessage(
        error instanceof Error
          ? `${error.message} Removed locally as a fallback.`
          : 'Removed locally because the database was not available.'
      )
    }

    removeProduct(productId)
    if (selectedProduct?.id === productId) {
      setSelectedProduct(null)
    }
  }

  const handleImportExistingCatalog = async () => {
    setIsImportingCatalog(true)
    setProductError('')

    try {
      const response = await fetch('/api/admin/products/seed', {
        method: 'POST',
      })
      const data = (await response.json()) as { message?: string; configured?: boolean }

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import the existing catalog.')
      }

      setProductMessage(data.message || 'Existing catalog imported successfully.')

      if (data.configured) {
        await syncProductsFromDatabase()
      }
    } catch (error) {
      setProductMessage(
        error instanceof Error ? error.message : 'Default catalog is already available locally.'
      )
    } finally {
      setIsImportingCatalog(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <PawPrint className="w-8 h-8 text-primary-500" />
              <span className="font-heading font-bold text-xl">
                <span className="text-dark">bow</span>
                <span className="text-primary-500">paw</span>
              </span>
              <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-600 text-xs font-medium rounded-full">
                {currentUser.role === 'admin' ? 'Admin' : 'Owner'}
              </span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Account Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <UserCircle className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>

                <AnimatePresence>
                  {showAccountSwitcher && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-medium">Switch Account</p>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {users.map(user => (
                          <button
                            key={user.id}
                            onClick={() => {
                              switchAccount(user.id)
                              setShowAccountSwitcher(false)
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                              currentUser.id === user.id ? 'bg-primary-50' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              user.role === 'admin' ? 'bg-red-500' :
                              user.role === 'owner' ? 'bg-purple-500' : 'bg-primary-500'
                            }`}>
                              {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              user.role === 'admin' ? 'bg-red-100 text-red-600' :
                              user.role === 'owner' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {user.role}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: Package },
            { id: 'carts', label: 'User Carts', icon: ShoppingCart },
            { id: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: formatPrice(totalRevenue), icon: DollarSign, color: 'green' },
                { label: 'Total Orders', value: totalOrders, icon: Package, color: 'blue' },
                { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'yellow' },
                { label: 'Active Users', value: activeUsers, icon: Users, color: 'purple' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                >
                  <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <p className="text-2xl font-bold text-dark">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-heading font-semibold text-lg">Recent Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-500">{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{order.userName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Product Management</h2>
                <p className="text-sm text-gray-500">Add products, update details, remove items, and manage the website catalog from here.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => void handleImportExistingCatalog()}
                  disabled={isImportingCatalog}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <RefreshCw className={`w-4 h-4 ${isImportingCatalog ? 'animate-spin' : ''}`} />
                  {isImportingCatalog ? 'Importing...' : 'Import Existing Catalog'}
                </button>
                <button
                  onClick={openCreateProduct}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

                {(productMessage || productError || isSyncingProducts) && (
              <div className={`rounded-2xl border px-4 py-3 text-sm ${
                productError
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-primary-100 bg-primary-50 text-primary-700'
              }`}>
                {isSyncingProducts
                  ? 'Syncing products from database...'
                  : productError || productMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, category, or product type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="relative sm:w-56">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All categories</option>
                  <option value="Fish">Fish</option>
                  <option value="Birds">Birds</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gray-100">
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{getProductTypeMeta(product.productType).label}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category}
                          {product.optionValues && product.optionValues.length > 0 && (
                            <p className="text-xs text-gray-400">
                              {product.optionGroupLabel}: {product.optionValues.join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.stock}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[product.status]}`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedProduct(product)}
                              className="rounded-lg p-2 text-primary-500 hover:bg-primary-50"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditProduct(product)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-primary-500">{order.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-gray-900">{order.userName}</p>
                          <p className="text-xs text-gray-500">{order.userEmail}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{order.items.length} items</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(order.total)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' :
                            order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 ${getStatusColor(order.status)}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-primary-500 hover:text-primary-600"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
              {selectedOrder && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                  onClick={() => setSelectedOrder(null)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="font-heading font-bold text-xl">Order {selectedOrder.id}</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Customer Info */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                        <p className="text-sm text-gray-600">{selectedOrder.userName}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.userEmail}</p>
                        <p className="text-sm text-gray-600">{selectedOrder.userPhone}</p>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <p className="text-sm text-gray-600">
                          {selectedOrder.shippingAddress.addressLine1}<br />
                          {selectedOrder.shippingAddress.addressLine2 && <>{selectedOrder.shippingAddress.addressLine2}<br /></>}
                          {selectedOrder.shippingAddress.area}, {selectedOrder.shippingAddress.city}<br />
                          {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}<br />
                          {selectedOrder.shippingAddress.country}
                        </p>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                                <Image
                                  src={item.productImage}
                                  alt={item.productName}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{item.productName}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                              <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span>{formatPrice(selectedOrder.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span>{selectedOrder.shipping === 0 ? 'Free' : formatPrice(selectedOrder.shipping)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax</span>
                          <span>{formatPrice(selectedOrder.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                          <span>Total</span>
                          <span className="text-primary-500">{formatPrice(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedOrder(null)}
                        className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* User Carts Tab */}
        {activeTab === 'carts' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {userCarts.map((cart, i) => (
              <motion.div
                key={cart.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {cart.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cart.userName}</p>
                      <p className="text-xs text-gray-500">{cart.userEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {cart.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cart Total</span>
                  <span className="font-bold text-primary-500">{formatPrice(cart.total)}</span>
                </div>
                <div className="px-4 pb-4">
                  <p className="text-xs text-gray-400">
                    Last updated: {new Date(cart.updatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}

            {userCarts.length === 0 && (
              <div className="col-span-full text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No user carts found</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                            user.role === 'admin' ? 'bg-red-500' :
                            user.role === 'owner' ? 'bg-purple-500' : 'bg-primary-500'
                          }`}>
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.mobile || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-600' :
                          user.role === 'owner' ? 'bg-purple-100 text-purple-600' :
                          user.role === 'user' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
                <button onClick={() => setSelectedProduct(null)} className="rounded-lg p-2 hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="grid gap-6 p-6 md:grid-cols-[220px_1fr]">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100">
                  <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      {selectedProduct.category} / {getProductTypeMeta(selectedProduct.productType).label}
                    </p>
                    <h4 className="text-2xl font-bold text-gray-900">{selectedProduct.name}</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-gray-500">Price</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatPrice(selectedProduct.price)}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-gray-500">Stock</p>
                      <p className="mt-1 font-semibold text-gray-900">{selectedProduct.stock}</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-gray-500">Options</p>
                      <p className="mt-1 font-semibold text-gray-900">
                        {selectedProduct.optionValues && selectedProduct.optionValues.length > 0
                          ? `${selectedProduct.optionGroupLabel}: ${selectedProduct.optionValues.join(', ')}`
                          : 'No extra options'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-gray-500">Status</p>
                      <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusColors[selectedProduct.status]}`}>
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showProductForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowProductForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <p className="text-sm text-gray-500">Manage product details for the storefront.</p>
                </div>
                <button onClick={() => setShowProductForm(false)} className="rounded-lg p-2 hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Product Name</label>
                  <input value={productForm.name} onChange={(e) => updateProductForm({ name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) =>
                      {
                        const nextCategory = e.target.value as ProductFormState['category']
                        const nextProductType =
                          nextCategory === 'Accessories' ? 'single-item' : productForm.productType
                        updateProductForm({
                          category: nextCategory,
                          productType: nextProductType,
                          ...getDefaultOptionState(nextProductType),
                        })
                      }
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Fish">Fish</option>
                    <option value="Birds">Birds</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Product Type</label>
                  <select
                    value={productForm.productType}
                    onChange={(e) => {
                      const nextProductType = e.target.value as ProductFormState['productType']
                      updateProductForm({
                        productType: nextProductType,
                        ...getDefaultOptionState(nextProductType),
                      })
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                  >
                    {productForm.category !== 'Accessories' && <option value="live-fish">Live Fish</option>}
                    <option value="fish-food">Fish Food</option>
                    <option value="single-item">Single Item</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Selling Price</label>
                  <input type="number" value={productForm.price} onChange={(e) => updateProductForm({ price: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Stock</label>
                  <input type="number" value={productForm.stock} onChange={(e) => updateProductForm({ stock: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setProductImageFile(file)
                      setProductError('')
                      if (file) {
                        const previewUrl = URL.createObjectURL(file)
                        setProductImagePreview(previewUrl)
                      }
                    }}
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">Upload one product image. SKU, subcategory, and description will be generated automatically.</p>
                </div>
                <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/40 p-4 md:col-span-2">
                  <p className="text-sm font-medium text-gray-800">Customer option preview</p>
                  <p className="mt-1 text-sm text-gray-600">{productTypeMeta[productForm.productType].description}</p>
                  {productForm.productType !== 'single-item' && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Option Label</label>
                        <input
                          value={productForm.optionGroupLabel}
                          onChange={(e) => updateProductForm({ optionGroupLabel: e.target.value })}
                          placeholder="Pack Size or Weight"
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Option Values</label>
                        <input
                          value={productForm.optionValuesText}
                          onChange={(e) => updateProductForm({ optionValuesText: e.target.value })}
                          placeholder="100 gm, 200 gm, 500 gm, 1 kg"
                          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:border-transparent focus:ring-2 focus:ring-primary-500"
                        />
                        <p className="mt-2 text-xs text-gray-500">Separate each option with a comma.</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(productForm.productType === 'single-item'
                      ? []
                      : productForm.optionValuesText
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean)
                    ).length > 0 ? (
                      productForm.optionValuesText
                        .split(',')
                        .map((value) => value.trim())
                        .filter(Boolean)
                        .map((option) => (
                        <span key={option} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-primary-700 shadow-sm">
                          {option}
                        </span>
                        ))
                    ) : (
                      <span className="text-xs text-gray-500">No selectable options for this product.</span>
                    )}
                  </div>
                </div>
                {productImagePreview && (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">Image Preview</label>
                    <div className="relative h-48 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      <Image
                        src={productImagePreview}
                        alt={productForm.name || 'Product preview'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={productForm.featured} onChange={(e) => updateProductForm({ featured: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
                    Mark as featured product
                  </label>
                </div>
                {productError && (
                  <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {productError}
                  </div>
                )}
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 p-6">
                <button onClick={() => { setShowProductForm(false); resetProductEditor() }} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  onClick={() => void handleSaveProduct()}
                  disabled={isSavingProduct}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save className="w-4 h-4" />
                  {isSavingProduct ? 'Saving...' : editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

