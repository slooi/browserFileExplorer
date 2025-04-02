import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollRestoration() {
	const location = useLocation();

	useEffect(() => {
		const savedScrollY = sessionStorage.getItem(`scroll-${location.pathname}`);
		if (savedScrollY !== null) {
			window.scrollTo(0, parseInt(savedScrollY, 10));
		}
	}, [location.pathname]);

	useEffect(() => {
		const handleScroll = () => {
			sessionStorage.setItem(`scroll-${location.pathname}`, window.scrollY.toString());
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [location.pathname]);
}
