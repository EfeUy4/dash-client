import BrandStory from "@/components/home/BrandStory";
import FeaturedCollection from "@/components/home/FeaturedCollection";
import HeroSection from "@/components/home/HeroSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import Newsletter from "@/components/home/Newsletter";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const HomePage = () => {
	return (
		<div className="min-h-screen">
			<HeroSection />
			<FeaturedCollection className="bg-neutral-50" />
			<StatsSection />
			<BrandStory />
			<TestimonialsSection />
			<NewArrivalsSection />
			<Newsletter />
		</div>
	);
};

export default HomePage;
