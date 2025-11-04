// services/productService.ts
import { Product } from '@/data/types'
import api from '@/utils/api'

class ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get('/products')
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }


  async getProduct(id: string): Promise<Product> {
    try {
      const response = await api.get(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post('/products', productData)
      return response.data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await api.put(`/products/${id}`, productData)
      return response.data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  async updateStock(id: string, stockCount: number): Promise<Product> {
    try {
      const response = await api.patch(`/products/${id}/stock`, { stockCount })
      return response.data
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }
}

export const productService = new ProductService()

