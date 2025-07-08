import { X, Package, Star, Calendar, Eye, Tag, Ruler, Weight } from "lucide-react";

interface Product {
	id: string;
	name: string;
	description: string;
	price: number;
	originalPrice?: number;
	images: string[];
	category: string;
	subcategory: string;
	sizes: string[];
	colors: string[];
	inStock: boolean;
	stockCount: number;
	rating: number;
	reviewCount: number;
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
	discountPercentage: number;
	createdAt: Date;
	updatedAt: Date;
}

interface ProductViewModalProps {
	product: Product;
	onClose: () => void;
	onEdit?: () => void;
}

const ProductViewModal = ({ product, onClose, onEdit }: ProductViewModalProps) => {
	const formatPrice = (price: number) => {
		return new Intl.NumberFormat("en-NG", {
			style: "currency",
			currency: "NGN",
		}).format(price);
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getStockStatus = () => {
		if (!product.inStock) return { text: "Out of Stock", class: "bg-red-100 text-red-800" };
		if (product.stockCount <= 10) return { text: "Low Stock", class: "bg-yellow-100 text-yellow-800" };
		return { text: "In Stock", class: "bg-green-100 text-green-800" };
	};

	const stockStatus = getStockStatus();

	return (
		<div className="fixed inset-0 z-50 overflow-y-auto">
			<div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
				<div className="fixed inset-0 transition-opacity" aria-hidden="true">
					<div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
				</div>

				<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
					<div className="absolute top-0 right-0 pt-4 pr-4 flex space-x-2">
						{onEdit && (
							<button
								type="button"
								onClick={onEdit}
								className="bg-purple-600 text-white rounded-md px-3 py-1 text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
							>
								Edit Product
							</button>
						)}
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
							{/* Header */}
							<div className="flex items-start justify-between mb-6">
								<div>
									<h3 className="text-xl leading-6 font-bold text-gray-900">{product.name}</h3>
									<p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
									<div className="flex items-center space-x-3 mt-2">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}
										>
											{stockStatus.text}
										</span>
										{product.isNewProduct && (
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
												New
											</span>
										)}
										{product.isFeatured && (
											<span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
												Featured
											</span>
										)}
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												product.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
											}`}
										>
											{product.isActive ? "Active" : "Inactive"}
										</span>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Left Column - Images & Basic Info */}
								<div className="space-y-6">
									{/* Product Images */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
											<Eye className="w-4 h-4 mr-2" />
											Product Images
										</h4>
										{product.images.length > 0 ? (
											<div className="grid grid-cols-2 gap-2">
												{product.images.slice(0, 4).map((image, index) => (
													<img
														key={index}
														src={image}
														alt={`${product.name} ${index + 1}`}
														className="w-full h-32 object-cover rounded-lg border border-gray-200"
													/>
												))}
												{product.images.length > 4 && (
													<div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
														<span className="text-gray-500 text-sm">+{product.images.length - 4} more</span>
													</div>
												)}
											</div>
										) : (
											<div className="w-full h-32 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
												<Package className="w-8 h-8 text-gray-400" />
											</div>
										)}
									</div>

									{/* Description */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-3">Description</h4>
										<p className="text-sm text-gray-700 leading-relaxed">{product.description}</p>
									</div>

									{/* Features */}
									{product.features.length > 0 && (
										<div className="bg-gray-50 p-4 rounded-lg">
											<h4 className="text-md font-medium text-gray-900 mb-3">Features</h4>
											<ul className="space-y-2">
												{product.features.map((feature, index) => (
													<li key={index} className="text-sm text-gray-700 flex items-start">
														<span className="w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
														{feature}
													</li>
												))}
											</ul>
										</div>
									)}
								</div>

								{/* Right Column - Details */}
								<div className="space-y-6">
									{/* Pricing & Stock */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4">Pricing & Stock</h4>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Current Price:</span>
												<span className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</span>
											</div>
											{product.originalPrice && product.originalPrice > product.price && (
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Original Price:</span>
													<span className="text-sm text-gray-500 line-through">
														{formatPrice(product.originalPrice)}
													</span>
												</div>
											)}
											{product.discountPercentage > 0 && (
												<div className="flex justify-between items-center">
													<span className="text-sm text-gray-600">Discount:</span>
													<span className="text-sm font-medium text-red-600">
														{product.discountPercentage}% OFF
													</span>
												</div>
											)}
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Stock Count:</span>
												<span className="text-sm font-medium text-gray-900">{product.stockCount} units</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Stock Status:</span>
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.class}`}
												>
													{stockStatus.text}
												</span>
											</div>
										</div>
									</div>

									{/* Category & Classification */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4">Category & Classification</h4>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Category:</span>
												<span className="text-sm font-medium text-gray-900">{product.category}</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Subcategory:</span>
												<span className="text-sm font-medium text-gray-900">{product.subcategory}</span>
											</div>
										</div>
									</div>

									{/* Variants */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4">Available Variants</h4>
										<div className="space-y-3">
											{product.sizes.length > 0 && (
												<div>
													<span className="text-sm text-gray-600 block mb-2">Sizes:</span>
													<div className="flex flex-wrap gap-2">
														{product.sizes.map((size, index) => (
															<span
																key={index}
																className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
															>
																{size}
															</span>
														))}
													</div>
												</div>
											)}
											{product.colors.length > 0 && (
												<div>
													<span className="text-sm text-gray-600 block mb-2">Colors:</span>
													<div className="flex flex-wrap gap-2">
														{product.colors.map((color, index) => (
															<span
																key={index}
																className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
															>
																{color}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
									</div>

									{/* Physical Properties */}
									{(product.weight ||
										(product.dimensions &&
											(product.dimensions.length > 0 ||
												product.dimensions.width > 0 ||
												product.dimensions.height > 0))) && (
										<div className="bg-gray-50 p-4 rounded-lg">
											<h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
												<Ruler className="w-4 h-4 mr-2" />
												Physical Properties
											</h4>
											<div className="space-y-3">
												{product.weight && product.weight > 0 && (
													<div className="flex justify-between items-center">
														<span className="text-sm text-gray-600 flex items-center">
															<Weight className="w-3 h-3 mr-1" />
															Weight:
														</span>
														<span className="text-sm font-medium text-gray-900">{product.weight} kg</span>
													</div>
												)}
												{product.dimensions &&
													(product.dimensions.length > 0 ||
														product.dimensions.width > 0 ||
														product.dimensions.height > 0) && (
														<div className="flex justify-between items-center">
															<span className="text-sm text-gray-600">Dimensions (L×W×H):</span>
															<span className="text-sm font-medium text-gray-900">
																{product.dimensions.length}×{product.dimensions.width}×
																{product.dimensions.height} cm
															</span>
														</div>
													)}
											</div>
										</div>
									)}

									{/* Rating & Reviews */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
											<Star className="w-4 h-4 mr-2" />
											Rating & Reviews
										</h4>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Average Rating:</span>
												<div className="flex items-center">
													<span className="text-sm font-medium text-gray-900 mr-1">
														{product.rating.toFixed(1)}
													</span>
													<Star className="w-4 h-4 text-yellow-400 fill-current" />
												</div>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Review Count:</span>
												<span className="text-sm font-medium text-gray-900">
													{product.reviewCount} reviews
												</span>
											</div>
										</div>
									</div>

									{/* Tags */}
									{product.tags.length > 0 && (
										<div className="bg-gray-50 p-4 rounded-lg">
											<h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
												<Tag className="w-4 h-4 mr-2" />
												Tags
											</h4>
											<div className="flex flex-wrap gap-2">
												{product.tags.map((tag, index) => (
													<span
														key={index}
														className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
													>
														#{tag}
													</span>
												))}
											</div>
										</div>
									)}

									{/* SEO Information */}
									{(product.seoTitle || product.seoDescription) && (
										<div className="bg-gray-50 p-4 rounded-lg">
											<h4 className="text-md font-medium text-gray-900 mb-4">SEO Information</h4>
											<div className="space-y-3">
												{product.seoTitle && (
													<div>
														<span className="text-sm text-gray-600 block mb-1">SEO Title:</span>
														<p className="text-sm text-gray-900">{product.seoTitle}</p>
													</div>
												)}
												{product.seoDescription && (
													<div>
														<span className="text-sm text-gray-600 block mb-1">SEO Description:</span>
														<p className="text-sm text-gray-900">{product.seoDescription}</p>
													</div>
												)}
											</div>
										</div>
									)}

									{/* Timestamps */}
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
											<Calendar className="w-4 h-4 mr-2" />
											Timeline
										</h4>
										<div className="space-y-3">
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Created:</span>
												<span className="text-sm font-medium text-gray-900">
													{formatDate(product.createdAt)}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-sm text-gray-600">Last Updated:</span>
												<span className="text-sm font-medium text-gray-900">
													{formatDate(product.updatedAt)}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* Footer */}
							<div className="mt-6 pt-4 border-t border-gray-200">
								<div className="flex justify-end">
									<button
										type="button"
										onClick={onClose}
										className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductViewModal;
