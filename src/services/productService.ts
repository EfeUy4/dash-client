// services/productService.ts
import { Product } from '@/data/types'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ProductService {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await axios.get(`${API_URL}/products`)
      return response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const response = await axios.get(`${API_URL}/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      throw error
    }
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axios.post(`${API_URL}/products`, productData)
      return response.data
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData)
      return response.data
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  async updateStock(id: string, stockCount: number): Promise<Product> {
    try {
      const response = await axios.patch(`${API_URL}/products/${id}/stock`, { stockCount })
      return response.data
    } catch (error) {
      console.error('Error updating stock:', error)
      throw error
    }
  }
}

export const productService = new ProductService()

