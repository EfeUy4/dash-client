// store/products/thunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "@/services/productService";
import { Product } from "@/data/types";

export const fetchProducts = createAsyncThunk<Product[]>(
  "products/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await productService.getProducts();
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch products");
    }
  }
);

export const fetchProduct = createAsyncThunk<Product, string>(
  "products/fetchOne",
  async (id, thunkAPI) => {
    try {
      return await productService.getProduct(id);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch product");
    }
  }
);

export const createProduct = createAsyncThunk<Product, Partial<Product>>(
  "products/create",
  async (data, thunkAPI) => {
    try {
      return await productService.createProduct(data);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to create product");
    }
  }
);

export const updateProduct = createAsyncThunk<Product, { id: string; data: Partial<Product> }>(
  "products/update",
  async ({ id, data }, thunkAPI) => {
    try {
      return await productService.updateProduct(id, data);
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to update product");
    }
  }
);

export const deleteProduct = createAsyncThunk<string, string>(
  "products/delete",
  async (id, thunkAPI) => {
    try {
      await productService.deleteProduct(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to delete product");
    }
  }
);