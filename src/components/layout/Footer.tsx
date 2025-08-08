import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import Logo from "../Logo";

const Footer = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = {
		shop: [
			{ name: "New Arrivals", href: "/new-arrivals" },
			{ name: "Best Sellers", href: "/products?sort=popular" },
			{ name: "Sale", href: "/products?sale=true" }
		],
		customer: [
			{ name: "Contact Us", href: "/support" },
			{ name: "Shipping Info", href: "/shipping" }
		],
		company: [
			{ name: "About Us", href: "/about" },
		],
		legal: [
			{ name: "Privacy Policy", href: "/privacy" },
			{ name: "Terms of Service", href: "/terms" },
		],
	};

	return (
		<footer className="bg-neutral-900 text-white">
			<div className="container">
				{/* Main Footer Content */}
				<div className="py-16">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
						{/* Brand Section */}
						<div className="lg:col-span-2">
							{/* Logo */}
							<Logo />

							<p className="text-neutral-300 mb-6 max-w-md mt-5">
								Elevate your style with our curated collection of premium clothing and accessories. Where
								luxury meets sophistication in every thread.
							</p>

							{/* Contact Info */}
							<div className="space-y-3 mb-6">
								<div className="flex items-center space-x-3">
									<Phone className="w-4 h-4 text-neutral-400" />
									<span className="text-neutral-300">+234 800 DASH NGS</span>
								</div>
								<div className="flex items-center space-x-3">
									<Mail className="w-4 h-4 text-neutral-400" />
									<span className="text-neutral-300">hello@dashngshop.com</span>
								</div>
								<div className="flex items-center space-x-3">
									<MapPin className="w-4 h-4 text-neutral-400" />
									<span className="text-neutral-300">Lagos, Nigeria</span>
								</div>
							</div>

							{/* Social Links */}
							<div className="flex space-x-4">
								<a
									href="https://facebook.com/dashngshop"
									className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
									aria-label="Follow us on Facebook"
								>
									<Facebook className="w-5 h-5" />
								</a>
								<a
									href="https://instagram.com/dashngshop"
									className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
									aria-label="Follow us on Instagram"
								>
									<Instagram className="w-5 h-5" />
								</a>
								<a
									href="https://twitter.com/dashngshop"
									className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 transition-colors"
									aria-label="Follow us on Twitter"
								>
									<Twitter className="w-5 h-5" />
								</a>
							</div>
						</div>

						{/* Shop Links */}
						<div>
							<h3 className="font-serif font-semibold text-lg mb-4">Shop</h3>
							<ul className="space-y-2">
								{footerLinks.shop.map((link) => (
									<li key={link.name}>
										<Link to={link.href} className="text-neutral-300 hover:text-white transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Customer Service */}
						<div>
							<h3 className="font-serif font-semibold text-lg mb-4">Customer Service</h3>
							<ul className="space-y-2">
								{footerLinks.customer.map((link) => (
									<li key={link.name}>
										<Link to={link.href} className="text-neutral-300 hover:text-white transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Company */}
						<div>
							<h3 className="font-serif font-semibold text-lg mb-4">Company</h3>
							<ul className="space-y-2">
								{footerLinks.company.map((link) => (
									<li key={link.name}>
										<Link to={link.href} className="text-neutral-300 hover:text-white transition-colors">
											{link.name}
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				{/* Bottom Footer */}
				<div className="border-t border-neutral-800 py-6">
					<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
						<div className="text-neutral-400 text-sm">© {currentYear} Dash. All rights reserved.</div>

						<div className="flex space-x-6">
							{footerLinks.legal.map((link) => (
								<Link
									key={link.name}
									to={link.href}
									className="text-neutral-400 hover:text-white text-sm transition-colors"
								>
									{link.name}
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
