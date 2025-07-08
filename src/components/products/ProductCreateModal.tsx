import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import api from "@/utils/api";
import { useToastUtils } from "@/services/toast";
import ImageUpload from "@/components/ui/ImageUpload";

interface NewProduct {
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	images: string[];
	category: string;
	subcategory: string;
	sizes: string[];
	colors: string[];
	stockCount: number;
	features: string[];
	isNewProduct: boolean;
	isFeatured: boolean;
	isActive: boolean;
	tags: string[];
	sku: string;
	weight?: number;
	dimensions?: {
		length: number;
		width: number;
		height: number;
	};
	seoTitle?: string;
	seoDescription?: string;
}

// Clothing & accessories categories
const PRODUCT_CATEGORIES = [
	"Men's Clothing",
	"Women's Clothing",
	"Children's Clothing",
	"Shoes & Footwear",
	"Bags & Handbags",
	"Jewelry & Accessories",
	"Watches",
	"Belts & Wallets",
	"Hats & Caps",
	"Sunglasses",
	"Scarves & Shawls",
	"Undergarments & Lingerie",
	"Activewear & Sportswear",
	"Formal Wear",
	"Casual Wear"
];

interface ProductCreateModalProps {
	onClose: () => void;
	onSave: (product: NewProduct) => void;
}

const ProductCreateModal = ({ onClose, onSave }: ProductCreateModalProps) => {
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: 0,
		originalPrice: 0,
		images: [] as string[],
		category: "",
		subcategory: "",
		sizes: [""],
		colors: [""],
		stockCount: 0,
		inStock: true, // Add inStock field
		features: [""],
		isNewProduct: false,
		isFeatured: false,
		isActive: true,
		tags: [""],
		sku: "",
		weight: 0,
		dimensions: {
			length: 0,
			width: 0,
			height: 0,
		},
		seoTitle: "",
		seoDescription: "",
	});

	const [categories] = useState(PRODUCT_CATEGORIES);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { showSuccessToast, showErrorToast } = useToastUtils();

	// No need to fetch categories anymore since they're predefined

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) newErrors.name = "Product name is required";
		if (!formData.description.trim()) newErrors.description = "Description is required";
		if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
		if (!formData.category) newErrors.category = "Category is required";
		if (!formData.subcategory.trim()) newErrors.subcategory = "Subcategory is required";
		if (!formData.sku.trim()) newErrors.sku = "SKU is required";
		if (formData.stockCount < 0) newErrors.stockCount = "Stock count cannot be negative";
		if (formData.originalPrice && formData.originalPrice < formData.price) {
			newErrors.originalPrice = "Original price must be greater than or equal to current price";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);

		try {
			// Clean up the data before sending
			const cleanedData = {
				...formData,
				images: formData.images, // Already filtered in ImageUpload component
				sizes: formData.sizes.filter(size => size.trim() !== ""),
				colors: formData.colors.filter(color => color.trim() !== ""),
				features: formData.features.filter(feature => feature.trim() !== ""),
				tags: formData.tags.filter(tag => tag.trim() !== ""),
				originalPrice: formData.originalPrice || undefined,
				weight: formData.weight || undefined,
				seoTitle: formData.seoTitle || undefined,
				seoDescription: formData.seoDescription || undefined,
			};

			const { data } = await api.post('/products', cleanedData);
			
			// The response should be the created product
			onSave(data);
			showSuccessToast("Product created successfully!");
			setTimeout(() => {
				onClose();
			}, 2000);
		} catch (error: any) {
			showErrorToast(error.response?.data?.message || "An error occurred while creating the product");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		
		if (name.includes('.')) {
			const [parent, child] = name.split('.');
			setFormData(prev => ({
				...prev,
				[parent]: {
					...prev[parent as keyof typeof prev] as any,
					[child]: type === "number" ? parseFloat(value) || 0 : value,
				},
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
					   type === "number" ? parseFloat(value) || 0 : value,
			}));
		}

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const handleArrayChange = (field: string, index: number, value: string) => {
		setFormData(prev => ({
			...prev,
			[field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
				i === index ? value : item
			)
		}));
	};

	const addArrayItem = (field: string) => {
		setFormData(prev => ({
			...prev,
			[field]: [...(prev[field as keyof typeof prev] as string[]), ""]
		}));
	};

	const removeArrayItem = (field: string, index: number) => {
		setFormData(prev => ({
			...prev,
			[field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
		}));
	};

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 transition-opacity" aria-hidden="true">
					<div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
				</div>

				<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
					<div className="absolute top-0 right-0 pt-4 pr-4">
						<button
							type="button"
							onClick={onClose}
							className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
						>
							<X className="h-6 w-6" />
						</button>
					</div>

					<div className="sm:flex sm:items-start">
						<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
							<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Product</h3>

							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Basic Information */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="md:col-span-2">
											<label htmlFor="name" className="block text-sm font-medium text-gray-700">
												Product Name *
											</label>
											<input
												type="text"
												name="name"
												id="name"
												required
												value={formData.name}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.name ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
										</div>

										<div className="md:col-span-2">
											<label htmlFor="description" className="block text-sm font-medium text-gray-700">
												Description *
											</label>
											<textarea
												name="description"
												id="description"
												rows={3}
												required
												value={formData.description}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.description ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
										</div>

										<div>
											<label htmlFor="sku" className="block text-sm font-medium text-gray-700">
												SKU *
											</label>
											<input
												type="text"
												name="sku"
												id="sku"
												required
												value={formData.sku}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.sku ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
										</div>

										<div>
											<label htmlFor="category" className="block text-sm font-medium text-gray-700">
												Category *
											</label>
											<select
												name="category"
												id="category"
												required
												value={formData.category}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.category ? "border-red-300" : "border-gray-300"
												}`}
											>
												<option value="">Select Category</option>
												{categories.map(category => (
													<option key={category} value={category}>{category}</option>
												))}
											</select>
											{errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
										</div>

										<div>
											<label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
												Subcategory *
											</label>
											<input
												type="text"
												name="subcategory"
												id="subcategory"
												required
												value={formData.subcategory}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.subcategory ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.subcategory && <p className="mt-1 text-sm text-red-600">{errors.subcategory}</p>}
										</div>
									</div>
								</div>

								{/* Pricing & Stock */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="text-md font-medium text-gray-900 mb-4">Pricing & Stock</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label htmlFor="price" className="block text-sm font-medium text-gray-700">
												Price (₦) *
											</label>
											<input
												type="number"
												name="price"
												id="price"
												required
												min="0"
												step="0.01"
												value={formData.price}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.price ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
										</div>

										<div>
											<label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700">
												Original Price (₦)
											</label>
											<input
												type="number"
												name="originalPrice"
												id="originalPrice"
												min="0"
												step="0.01"
												value={formData.originalPrice}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.originalPrice ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.originalPrice && <p className="mt-1 text-sm text-red-600">{errors.originalPrice}</p>}
										</div>

										<div>
											<label htmlFor="stockCount" className="block text-sm font-medium text-gray-700">
												Stock Count *
											</label>
											<input
												type="number"
												name="stockCount"
												id="stockCount"
												required
												min="0"
												value={formData.stockCount}
												onChange={handleChange}
												className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500 ${
													errors.stockCount ? "border-red-300" : "border-gray-300"
												}`}
											/>
											{errors.stockCount && <p className="mt-1 text-sm text-red-600">{errors.stockCount}</p>}
										</div>
									</div>

									{/* Stock Status Control */}
									<div className="mt-4 p-3 bg-white rounded border">
										<div className="flex items-center justify-between">
											<div>
												<label htmlFor="inStock" className="block text-sm font-medium text-gray-700">
													In Stock Status
												</label>
												<p className="text-xs text-gray-500 mt-1">
													Override automatic stock calculation (useful for quality issues, seasonal items, etc.)
												</p>
											</div>
											<div className="flex items-center">
												<input
													type="checkbox"
													name="inStock"
													id="inStock"
													checked={formData.inStock}
													onChange={handleChange}
													className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
												/>
												<label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
													Available for Sale
												</label>
											</div>
										</div>
										
										{/* Stock Status Indicator */}
										<div className="mt-2 text-xs">
											<span className="text-gray-600">Current Status: </span>
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												formData.inStock 
													? (formData.stockCount > 0 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800")
													: "bg-red-100 text-red-800"
											}`}>
												{formData.inStock 
													? (formData.stockCount > 0 ? "In Stock" : "Marked Available (No Inventory)")
													: "Out of Stock"
												}
											</span>
										</div>
									</div>
								</div>

								{/* Product Images */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="text-md font-medium text-gray-900 mb-4">Product Images</h4>
									<ImageUpload
										images={formData.images}
										onImagesChange={(images) => setFormData(prev => ({ ...prev, images }))}
										maxImages={5}
									/>
								</div>

								{/* Variants */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4">Sizes</h4>
										{formData.sizes.map((size, index) => (
											<div key={index} className="flex items-center space-x-2 mb-2">
												<input
													type="text"
													placeholder="Size (e.g., S, M, L)"
													value={size}
													onChange={(e) => handleArrayChange('sizes', index, e.target.value)}
													className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
												/>
												{formData.sizes.length > 1 && (
													<button
														type="button"
														onClick={() => removeArrayItem('sizes', index)}
														className="text-red-600 hover:text-red-800"
													>
														<Minus className="w-4 h-4" />
													</button>
												)}
											</div>
										))}
										<button
											type="button"
											onClick={() => addArrayItem('sizes')}
											className="flex items-center text-purple-600 hover:text-purple-800"
										>
											<Plus className="w-4 h-4 mr-1" />
											Add Size
										</button>
									</div>

									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4">Colors</h4>
										{formData.colors.map((color, index) => (
											<div key={index} className="flex items-center space-x-2 mb-2">
												<input
													type="text"
													placeholder="Color (e.g., Red, Blue)"
													value={color}
													onChange={(e) => handleArrayChange('colors', index, e.target.value)}
													className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
												/>
												{formData.colors.length > 1 && (
													<button
														type="button"
														onClick={() => removeArrayItem('colors', index)}
														className="text-red-600 hover:text-red-800"
													>
														<Minus className="w-4 h-4" />
													</button>
												)}
											</div>
										))}
										<button
											type="button"
											onClick={() => addArrayItem('colors')}
											className="flex items-center text-purple-600 hover:text-purple-800"
										>
											<Plus className="w-4 h-4 mr-1" />
											Add Color
										</button>
									</div>
								</div>

								{/* Settings */}
								<div className="bg-gray-50 p-4 rounded-lg">
									<h4 className="text-md font-medium text-gray-900 mb-4">Product Settings</h4>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div className="flex items-center">
											<input
												type="checkbox"
												name="isNewProduct"
												id="isNewProduct"
												checked={formData.isNewProduct}
												onChange={handleChange}
												className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
											/>
											<label htmlFor="isNewProduct" className="ml-2 block text-sm text-gray-900">
												New Product
											</label>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												name="isFeatured"
												id="isFeatured"
												checked={formData.isFeatured}
												onChange={handleChange}
												className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
											/>
											<label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
												Featured Product
											</label>
										</div>

										<div className="flex items-center">
											<input
												type="checkbox"
												name="isActive"
												id="isActive"
												checked={formData.isActive}
												onChange={handleChange}
												className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
											/>
											<label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
												Active Product
											</label>
										</div>
									</div>
								</div>

								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={onClose}
										className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={loading}
										className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
									>
										{loading ? "Creating..." : "Create Product"}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductCreateModal;