import { useState } from 'react';
import './App.css';
import NumberInput from './NumberInput.jsx';

function App() {
	const [ironPrice, setIronPrice] = useState(32);
	const commodityPrice = ironPrice * 5000;

	function setCommodityPrice(newPrice) {
		setIronPrice(newPrice / 5000);
	}

	return (
		<>
			<NumberInput label="Iron Ingot Price:" defaultValue={ironPrice} onChange={setIronPrice} />
			<NumberInput
				label="Iron Commodity Price:"
				integerOnly="true"
				defaultValue={commodityPrice}
				onChange={setCommodityPrice}
			/>
			<div>
				<div>hello world</div>
			</div>
		</>
	);
}

export default App;
