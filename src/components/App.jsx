import { useState } from 'react';
import './App.css';
import NumberInput from './NumberInput.jsx';
import { tinkerData } from '../tinkerdata.js';
import { Material, GemVendorPrice } from '../constants.js';

function numToGoldString(num) {
	if (isNaN(num)) {
		return '----';
	}
	return `${num.toLocaleString()} gold`;
}

function jewelString(gem) {
	switch (gem) {
		case null:
			return '----';

		case 'diamond':
			return 'diamond necklace';

		default:
			return `${gem} beads`;
	}
}

function App() {
	const [ironPrice, setIronPrice] = useState(32);
	const commodityPrice = ironPrice * 5000;

	function setCommodityPrice(newPrice) {
		setIronPrice(newPrice / 5000);
	}

	const [citrinePrice, setCitrinePrice] = useState(20);
	const [tourmalinePrice, setTourmalinePrice] = useState(30);
	const [amberPrice, setAmberPrice] = useState(40);
	const [amethystPrice, setAmethystPrice] = useState(55);
	const [rubyPrice, setRubyPrice] = useState(65);
	const [sapphirePrice, setSapphirePrice] = useState(75);
	const [emeraldPrice, setEmeraldPrice] = useState(200);
	const [starSapphirePrice, setStarSapphirePrice] = useState(230);
	const [diamondPrice, setDiamondPrice] = useState(250);

	const [tinkerSkill, setTinkerSkill] = useState(0);
	const [artisanLevel, setArtisanLevel] = useState(0);
	const [isUsingArtisan, setIsUsingArtisan] = useState(false);

	function handleUseArtisanChange(e) {
		const value = e.target.checked;
		setIsUsingArtisan(value);
	}

	const jewelPrices = {
		[Material.CITRINE]: citrinePrice,
		[Material.TOURMALINE]: tourmalinePrice,
		[Material.AMBER]: amberPrice,
		[Material.AMETHYST]: amethystPrice,
		[Material.RUBY]: rubyPrice,
		[Material.SAPPHIRE]: sapphirePrice,
		[Material.EMERALD]: emeraldPrice,
		[Material.STAR_SAPPHIRE]: starSapphirePrice,
		[Material.DIAMOND]: diamondPrice,
	};

	const costCalculations = tinkerData.map((range) => {
		const jewelPrice = jewelPrices[range.gemName];
		const ironItemCost = range.ironItemCost(ironPrice);
		const ironNetCost = range.expectedIronItemCost(ironPrice);
		const jewelItemCost = isUsingArtisan
			? range.jewelItemCostWithArtisan(ironPrice, jewelPrice, artisanLevel)
			: range.jewelItemCost(ironPrice, jewelPrice);
		const jewelNetCost = isUsingArtisan
			? range.expectedJewelItemCostWithArtisan(ironPrice, jewelPrice, artisanLevel)
			: range.expectedJewelItemCost(ironPrice, jewelPrice);
		const jewelPresalesCost = range.expectedJewelPresalesCost(ironPrice, jewelPrice);

		// start and end levels are inclusive ranges
		const belowRange = tinkerSkill < range.startLevel;
		const aboveRange = tinkerSkill > range.endLevel;

		let remaining;
		if (belowRange) {
			remaining = range.expectedCraftAttempts();
		} else if (aboveRange) {
			remaining = 0;
		} else {
			// in range
			const skillRemaining = (range.endLevel - tinkerSkill) * 10;
			remaining = Math.round(skillRemaining / range.levelChance);
		}

		const ironIsCheaper = !range.gemName || ironNetCost < jewelNetCost;

		const remainingCost = ironIsCheaper ? remaining * ironItemCost : remaining * jewelItemCost;

		return {
			tinkerSkill: range.levelRangeString(),
			craftAttempts: range.expectedCraftAttempts(),
			gem: range.gemName,
			ironItem: range.ironItemName,
			jewelNetCost: Math.round(jewelNetCost),
			ironItemNetCost: Math.round(ironNetCost),
			jewelPreSalesCost: Math.round(jewelPresalesCost),
			jewelSalesRevenue: Math.round(jewelPresalesCost - jewelNetCost),
			remaining,
			disabled: aboveRange,
			ironIsCheaper,
			remainingCost,
			ironItemMaterials: range.ironItemMaterials,
			jewelMaterials: range.jewelMaterials,
		};
	});

	const totalCost = Math.round(
		costCalculations.reduce(
			(acc, curr) => acc + (curr.ironIsCheaper ? curr.ironItemNetCost : curr.jewelNetCost),
			0,
		),
	);
	const remainingCost = Math.round(costCalculations.reduce((acc, curr) => acc + curr.remainingCost, 0));

	const shoppingList = costCalculations.reduce((acc, currRange) => {
		if (currRange.ironIsCheaper) {
			const count = Math.round(currRange.remainingCost / ironPrice);

			acc[Material.IRON] += count;
			return acc;
		}

		const cheaperMats = currRange.ironIsCheaper ? currRange.ironItemMaterials : currRange.jewelMaterials;

		Array.from(Object.entries(cheaperMats)).forEach(([mat, count]) => {
			acc[mat] = acc[mat] ? acc[mat] + count * currRange.remaining : count * currRange.remaining;
		});

		return acc;
	}, {});

	const shoppingListUpfrontCost = Array.from(Object.entries(shoppingList)).reduce(
		(acc, [mat, qty]) => acc + (mat === Material.IRON ? qty * ironPrice : qty * jewelPrices[mat]),
		0,
	);

	return (
		<>
			<h1>Tinker Costs Calculator</h1>

			<section>
				<h2>Current Iron Prices</h2>
				<p>Input either single ingot price or commodity price</p>
				<fieldset className="iron-price-form">
					<legend>Iron Prices (sourced average)</legend>
					<NumberInput label="Iron Ingot Price:" defaultValue={ironPrice} onChange={setIronPrice} />
					<NumberInput
						label="Iron Commodity Price:"
						integerOnly="true"
						defaultValue={commodityPrice}
						onChange={setCommodityPrice}
					/>
				</fieldset>
			</section>

			<section>
				<h2>Current Skill Level</h2>
				<p>
					Tinkering skill level is used for total cost calculator. Inputting your skill level will effect the
					remaining cost calculation.
				</p>
				<p>
					Artisan level is only used when checkbox is checked. In practice it barely makes a difference. Will
					change calculations of all calculators based on increased chance of exceptional jewels
				</p>
				<fieldset className="level-fields">
					<legend>Current Levels</legend>
					<NumberInput label="Tinkering Skill:" defaultValue={tinkerSkill} onChange={setTinkerSkill} />
					<NumberInput
						label="Artisan Level:"
						integerOnly="true"
						defaultValue={artisanLevel}
						onChange={setArtisanLevel}
						min={0}
						max={15}
					/>
					<div className="span2">
						<label className="using-artisan-label" htmlFor="using-artisan-checkbox">
							Use Artisan:
						</label>
						<input
							type="checkbox"
							className="using-artisan-checkbox"
							id="using-artisan-checkbox"
							checked={isUsingArtisan}
							onChange={handleUseArtisanChange}
						/>
					</div>
				</fieldset>
			</section>

			<section>
				<h2>Break Even Prices</h2>
				<table className="breakeven-table">
					<thead>
						<tr>
							<th>Tinker Skill</th>
							<th>Gem</th>
							<th>Break-Even Price</th>
							<th>% of Vendor Price</th>
						</tr>
					</thead>

					<tbody>
						{tinkerData.map((range) => {
							const key = crypto.randomUUID();
							return (
								<tr key={key}>
									<td>{range.levelRangeString()}</td>
									<td>{range.gemName}</td>
									<td>
										{isUsingArtisan
											? range.breakevenGemPriceWithArtisanString(ironPrice, artisanLevel)
											: range.breakevenGemPriceString(ironPrice)}
									</td>
									<td>
										{isUsingArtisan
											? range.gemVendorPriceRatioWithArtisanString(ironPrice, artisanLevel)
											: range.gemVendorPriceRatioString(ironPrice)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
				<p>
					Buying gems at market at any price below makes crafting with gems worth it. If gem market prices are
					above the breakeven price, the iron item (such as candelabras) is a better deal to craft
				</p>
				<p>
					Using percent ratios compared to the vendor sell price of gems is useful when making WTB offers for
					gems in Outlands main discord
				</p>
			</section>

			<section>
				<h2>Total Cost Calculator</h2>
				<p>
					All costs and required material counts are "expected" costs based on chance of skill gain. Un/lucky
					runs can make your actual costs vary.
				</p>
				<p>
					You must update fields for accurate costs at the average price available to you to source the gems.
					If you're only interested in "remaining cost" based on your tinker skill level input above, you do
					not need to update gem prices associated with previous levels
				</p>
				<p>
					Gem price fields are populated by default at market prices at the time of creating this calculator.
				</p>
				<fieldset className="gem-price-fields">
					<legend>Gem Prices (sourced average)</legend>
					<NumberInput label="Citrine:" defaultValue={citrinePrice} onChange={setCitrinePrice} />
					<NumberInput label="Tourmaline:" defaultValue={tourmalinePrice} onChange={setTourmalinePrice} />
					<NumberInput label="Amber:" defaultValue={amberPrice} onChange={setAmberPrice} />
					<NumberInput label="Amethyst:" defaultValue={amethystPrice} onChange={setAmethystPrice} />
					<NumberInput label="Ruby:" defaultValue={rubyPrice} onChange={setRubyPrice} />
					<NumberInput label="Sapphire:" defaultValue={sapphirePrice} onChange={setSapphirePrice} />
					<NumberInput label="Emerald:" defaultValue={emeraldPrice} onChange={setEmeraldPrice} />
					<NumberInput
						label="Star Sapphire:"
						defaultValue={starSapphirePrice}
						onChange={setStarSapphirePrice}
					/>
					<NumberInput label="Diamond:" defaultValue={diamondPrice} onChange={setDiamondPrice} />
				</fieldset>

				<div className="table-container">
					<table className="total-costs-table">
						<thead>
							<tr>
								<th>Tinker Skill</th>
								<th>Craft Attempts</th>
								{tinkerSkill > 0 && <th>Attempts Remaining</th>}
								<th>Jewel</th>
								<th>Iron Item</th>
								<th>Jewel Net Cost</th>
								<th>Iron Item Net Cost</th>
								<th className="first-col">Jewel Pre-Sales Cost</th>
								<th>Jewel Sales Revenue</th>
							</tr>
						</thead>

						<tbody>
							{costCalculations.map((c) => {
								const key = crypto.randomUUID();
								return (
									<tr data-disabled={c.disabled} key={key}>
										<td>{c.tinkerSkill}</td>
										<td>{c.craftAttempts}</td>
										{tinkerSkill > 0 && <td>{c.remaining}</td>}
										<td data-expensive={c.ironIsCheaper}>{jewelString(c.gem)}</td>
										<td data-expensive={!c.ironIsCheaper}>{c.ironItem}</td>
										<td data-expensive={c.ironIsCheaper}>{numToGoldString(c.jewelNetCost)}</td>
										<td data-expensive={!c.ironIsCheaper}>{numToGoldString(c.ironItemNetCost)}</td>
										<td className="first-col">{numToGoldString(c.jewelPreSalesCost)}</td>
										<td>{numToGoldString(c.jewelSalesRevenue)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				<div className="totals">
					{tinkerSkill > 0 && <p>Remaining Expected Cost: {numToGoldString(remainingCost)}</p>}
					<p>Total Expected Cost: {numToGoldString(totalCost)}</p>
				</div>
			</section>

			<section>
				<h2>Shopping List</h2>
				<table className="shopping-list-table">
					<thead>
						<tr>
							<th>Material</th>
							<th>Quantity</th>
						</tr>
					</thead>
					<tbody>
						{shoppingList[Material.IRON] > 0 && (
							<tr>
								<td>iron ingots:</td>
								<td>{shoppingList[Material.IRON]}</td>
							</tr>
						)}
						{shoppingList[Material.CITRINE] > 0 && (
							<tr>
								<td>{[Material.CITRINE]}:</td>
								<td>{shoppingList[Material.CITRINE]}</td>
							</tr>
						)}
						{shoppingList[Material.TOURMALINE] > 0 && (
							<tr>
								<td>{[Material.TOURMALINE]}:</td>
								<td>{shoppingList[Material.TOURMALINE]}</td>
							</tr>
						)}
						{shoppingList[Material.AMBER] > 0 && (
							<tr>
								<td>{[Material.AMBER]}:</td>
								<td>{shoppingList[Material.AMBER]}</td>
							</tr>
						)}
						{shoppingList[Material.AMETHYST] > 0 && (
							<tr>
								<td>{[Material.AMETHYST]}:</td>
								<td>{shoppingList[Material.AMETHYST]}</td>
							</tr>
						)}
						{shoppingList[Material.RUBY] > 0 && (
							<tr>
								<td>{[Material.RUBY]}:</td>
								<td>{shoppingList[Material.RUBY]}</td>
							</tr>
						)}
						{shoppingList[Material.SAPPHIRE] > 0 && (
							<tr>
								<td>{[Material.SAPPHIRE]}:</td>
								<td>{shoppingList[Material.SAPPHIRE]}</td>
							</tr>
						)}
						{shoppingList[Material.EMERALD] > 0 && (
							<tr>
								<td>{[Material.EMERALD]}:</td>
								<td>{shoppingList[Material.EMERALD]}</td>
							</tr>
						)}
						{shoppingList[Material.STAR_SAPPHIRE] > 0 && (
							<tr>
								<td>{[Material.STAR_SAPPHIRE]}:</td>
								<td>{shoppingList[Material.STAR_SAPPHIRE]}</td>
							</tr>
						)}
						{shoppingList[Material.DIAMOND] > 0 && (
							<tr>
								<td>{[Material.DIAMOND]}:</td>
								<td>{shoppingList[Material.DIAMOND]}</td>
							</tr>
						)}
					</tbody>
				</table>
				<div className="totals">
					<p>Total Upfront Shopping Cost: {numToGoldString(shoppingListUpfrontCost)}</p>
				</div>
			</section>
		</>
	);
}

export default App;
