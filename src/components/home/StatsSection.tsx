import { useState, useEffect, useRef } from "react";
import { Star, Users, ShoppingBag, ThumbsUp } from "lucide-react";

const StatsSection = () => {
	const stats = [
		{
			id: 1,
			icon: <Star className="sm:w-8 sm:h-8 w-4 h-4 text-yellow-400" strokeWidth={1} />,
			value: 4.9,
			label: "Rating",
			suffix: "",
			decimals: 1,
		},
		{
			id: 2,
			icon: <Users className="sm:w-8 sm:h-8 w-4 h-4 text-blue-500" strokeWidth={1} />,
			value: 50,
			label: "Customers",
			suffix: "K+",
			decimals: 0,
		},
		{
			id: 3,
			icon: <ShoppingBag className="sm:w-8 sm:h-8 w-4 h-4 text-purple-600" strokeWidth={1} />,
			value: 200,
			label: "Products",
			suffix: "+",
			decimals: 0,
		},
		{
			id: 4,
			icon: <ThumbsUp className="sm:w-8 sm:h-8 w-4 h-4 text-green-500" strokeWidth={1} />,
			value: 98,
			label: "Satisfaction",
			suffix: "%",
			decimals: 0,
		},
	];

	// Animation logic for counting up numbers
	const CountUpAnimation = ({ value, decimals, suffix }: any) => {
		const [count, setCount] = useState(0);
		const [hasAnimated, setHasAnimated] = useState(false);
		const elementRef = useRef(null);

		useEffect(() => {
			const observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting && !hasAnimated) {
						setHasAnimated(true);

						// Animate count from 0 to target value
						const end = value;
						const duration = 2000; // 2 seconds
						const startTime = Date.now();

						const animate = () => {
							const elapsed = Date.now() - startTime;
							const progress = Math.min(elapsed / duration, 1);

							// Easing function for smooth animation
							const easeOutCubic = 1 - Math.pow(1 - progress, 3);
							const current = end * easeOutCubic;

							setCount(current);

							if (progress < 1) {
								requestAnimationFrame(animate);
							}
						};

						animate();
						observer.disconnect();
					}
				},
				{ threshold: 0.1 },
			);

			if (elementRef.current) {
				observer.observe(elementRef.current);
			}

			return () => observer.disconnect();
		}, [value, hasAnimated]);

		const formattedCount = count.toFixed(decimals);

		return (
			<div ref={elementRef} className="text-lg sm:text-3xl font-semibold">
				{formattedCount}
				{suffix}
			</div>
		);
	};

	return (
		<section className="py-10 bg-primary-950 text-white">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-7">
					{stats.map((stat, index) => (
						<div
							key={stat.id}
							className="flex items-center gap-3 sm:gap-5 bg-black/20 rounded-xl sm:p-5 p-4 hover:bg-primary-700/50 transition-colors opacity-0"
							style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
						>
							<div className="flex-shrink-0 sm:w-16 sm:h-16 w-10 h-10 rounded-full bg-primary-950/90 flex items-center justify-center">
								{stat.icon}
							</div>
							<div className="">
								<CountUpAnimation value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
								<p className="text-primary-300 mt-1 max-sm:text-xs">{stat.label}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			<style>{`
				@keyframes fadeInUp {
					from {
						opacity: 0;
						transform: translateY(20px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}</style>
		</section>
	);
};

export default StatsSection;
