import { useState } from 'react';
import './App.css';
import NumberInput from './NumberInput.jsx';
import { tinkerData } from '../tinkerdata.js';

function App() {
	const [ironPrice, setIronPrice] = useState(32);
	const commodityPrice = ironPrice * 5000;

	function setCommodityPrice(newPrice) {
		setIronPrice(newPrice / 5000);
	}

	return (
		<>
			<h1>Tinker Costs Calculator</h1>
			<section className="iron-price-section">
				<NumberInput label="Iron Ingot Price:" defaultValue={ironPrice} onChange={setIronPrice} />
				<NumberInput
					label="Iron Commodity Price:"
					integerOnly="true"
					defaultValue={commodityPrice}
					onChange={setCommodityPrice}
				/>
			</section>
			<section>
				<h2>Break Even Prices</h2>
				<table className="breakeven-table">
					<thead>
						<th>Tinker Level</th>
						<th>Gem</th>
						<th>Break-Even Price</th>
						<th>% of Vendor Price</th>
					</thead>
					<tbody>
						{tinkerData.map((range) => {
							return (
								<tr>
									<td>{range.levelRangeString()}</td>
									<td>{range.gemName}</td>
									<td>{range.breakevenGemPriceString(ironPrice)}</td>
									<td>{range.gemVendorPriceRatioString(ironPrice)}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<p>
					Buying gems at market at any price below makes crafting with gems worth it. If gem market prices are
					above the breakeven price, the iron item (such as candelabras) is a better deal to craft
				</p>
			</section>
		</>
	);
}

export default App;
