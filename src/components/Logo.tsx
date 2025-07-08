import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Logo() {
	return (
		<Link to="/">
			<img src={logo} alt="Dash NG logo" width={60} />
		</Link>
	);
}
