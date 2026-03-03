import { GemVendorPrice } from './constants.js';

function percentString(decimal) {
	return `${decimal * 100}%`;
}

// All Chance args are passed as % because it's easier to type, so they're divided by 100 in the constructor
export default class TinkerLevelRange {
	constructor(
		startLevel,
		endLevel,
		levelChance,
		startIronSuccessChance,
		endIronSuccessChance,
		startJewelSuccessChance,
		endJewelSuccessChance,
		startJewelExceptionalChance,
		endJewelExceptionalChance,
		ironItemMaterials,
		jewelMaterials,
		ironItemName,
		jewelName,
		jewelValue,
		jewelExceptionalValue,
		gemName,
	) {
		this.startLevel = startLevel;
		this.endLevel = endLevel;
		this.levelChance = levelChance / 100;
		this.startIronSuccessChance = startIronSuccessChance / 100;
		this.endIronSuccessChance = endIronSuccessChance / 100;
		this.startJewelSuccessChance = startJewelSuccessChance / 100;
		this.endJewelSuccessChance = endJewelSuccessChance / 100;
		this.startJewelExceptionalChance = startJewelExceptionalChance / 100;
		this.endJewelExceptionalChance = endJewelExceptionalChance / 100;
		this.ironItemMaterials = ironItemMaterials;
		this.jewelMaterials = jewelMaterials;
		this.ironItemName = ironItemName;
		this.jewelName = jewelName;
		this.jewelValue = jewelValue;
		this.jewelExceptionalValue = jewelExceptionalValue;
		this.gemName = gemName;
	}

	// FORMULAS
	// average expected costs of crafting one of item type depending on success/exceptional/fail rates
	// iron item costs are net after recycling on success
	// jewel costs are net after selling back the jewel to vendor
	ironItemCost(ironPrice) {
		return this.ironSuccessChance() * ironPrice * 3 + this.ironFailChance() * ironPrice * 5;
	}

	jewelItemCost(ironPrice, jewelPrice) {
		const materialCost = ironPrice + jewelPrice;

		const jewelFailPrice = this.jewelFailChance() * materialCost;
		const jewelExceptionalPrice =
			this.jewelSuccessAndExceptionalChance() * (materialCost - this.jewelExceptionalValue);
		const jewelNonExceptionalPrice = this.jewelSuccessAndNonExceptionalChance() * (materialCost - this.jewelValue);

		return jewelFailPrice + jewelExceptionalPrice + jewelNonExceptionalPrice;
	}

	jewelItemCostWithArtisan(ironPrice, jewelPrice, artisanLevel) {
		const materialCost = ironPrice + jewelPrice;

		const jewelFailPrice = this.jewelFailChance() * materialCost;
		const jewelExceptionalPrice =
			this.jewelSuccessAndExceptionalChanceWithArtisan(artisanLevel) *
			(materialCost - this.jewelExceptionalValue);
		const jewelNonExceptionalPrice =
			this.jewelSuccessAndNonExceptionalChanceWithArtisan(artisanLevel) * (materialCost - this.jewelValue);

		return jewelFailPrice + jewelExceptionalPrice + jewelNonExceptionalPrice;
	}

	// TOTAL COSTS
	// uses formulas above for single item expected costs and multiplies by expected craft attempts
	// skills have same chance of gain on success and fail attempts
	// since single item costs are net after recycle/selling, these are also net costs for the entire level gain range
	expectedCraftAttempts() {
		const skillPoints = 50; // 5.0 skill points at 0.1 gain each
		return Math.round(skillPoints / this.levelChance);
	}

	expectedIronItemCost(ironPrice) {
		return this.expectedCraftAttempts() * this.ironItemCost(ironPrice);
	}

	expectedJewelItemCost(ironPrice, jewelPrice) {
		return this.expectedCraftAttempts() * this.jewelItemCost(ironPrice, jewelPrice);
	}

	expectedJewelItemCostWithArtisan(ironPrice, jewelPrice, artisanLevel) {
		return this.expectedCraftAttempts() * this.jewelItemCostWithArtisan(ironPrice, jewelPrice, artisanLevel);
	}

	expectedJewelPresalesCost(ironPrice, jewelPrice) {
		return this.expectedCraftAttempts() * (ironPrice + jewelPrice);
	}

	// BREAKEVEN GEM PRICE
	// the price of gem where the cost of crafting jewels equals the cost of crafting iron items
	breakevenGemPrice(ironPrice) {
		const ironItemCost = this.ironItemCost(ironPrice);
		const Y = this.jewelFailChance();
		const Z = this.jewelSuccessAndExceptionalChance();
		const A = this.jewelExceptionalValue;
		const B = this.jewelSuccessAndNonExceptionalChance();
		const C = this.jewelValue;

		// (Y * (ironPrice + result)) + (Z * ((ironPrice + result) - A)) + (B * ((ironPrice + result) - C)) = ironItemCost;
		// Y*result + Z*result + B*result  = ironItemCost + B*C - B*ironPrice + Z*A - Z*ironPrice - Y*ironPrice
		// (Y + Z + B) * result = ironItemCost + B*C - B*ironPrice + Z*A - Z*ironPrice - Y*ironPrice
		return Math.round(ironItemCost + B * C - B * ironPrice + Z * A - Z * ironPrice - Y * ironPrice) / (Y + Z + B);
	}

	breakevenGemPriceWithArtisan(ironPrice, artisanLevel) {
		const ironItemCost = this.ironItemCost(ironPrice);
		const Y = this.jewelFailChance();
		const Z = this.jewelSuccessAndExceptionalChanceWithArtisan(artisanLevel);
		const A = this.jewelExceptionalValue;
		const B = this.jewelSuccessAndNonExceptionalChanceWithArtisan(artisanLevel);
		const C = this.jewelValue;

		// (Y * (ironPrice + result)) + (Z * ((ironPrice + result) - A)) + (B * ((ironPrice + result) - C)) = ironItemCost;
		// Y*result + Z*result + B*result  = ironItemCost + B*C - B*ironPrice + Z*A - Z*ironPrice - Y*ironPrice
		// (Y + Z + B) * result = ironItemCost + B*C - B*ironPrice + Z*A - Z*ironPrice - Y*ironPrice
		return Math.round(ironItemCost + B * C - B * ironPrice + Z * A - Z * ironPrice - Y * ironPrice) / (Y + Z + B);
	}

	gemVendorPriceRatio(ironPrice) {
		const breakevenPrice = this.breakevenGemPrice(ironPrice);
		const gemVendorPrice = GemVendorPrice[this.gemName];
		return breakevenPrice / gemVendorPrice;
	}

	gemVendorPriceRatioWithArtisan(ironPrice, artisanLevel) {
		const breakevenPrice = this.breakevenGemPriceWithArtisan(ironPrice, artisanLevel);
		const gemVendorPrice = GemVendorPrice[this.gemName];
		return breakevenPrice / gemVendorPrice;
	}

	// CHANCE CALCULATIONS
	ironSuccessChance() {
		return (this.startIronSuccessChance + this.endIronSuccessChance) / 2;
	}

	ironFailChance() {
		return 1 - this.ironSuccessChance();
	}

	jewelSuccessChance() {
		return (this.startJewelSuccessChance + this.endJewelSuccessChance) / 2;
	}

	jewelFailChance() {
		return 1 - this.jewelSuccessChance();
	}

	jewelExceptionalChance() {
		return (this.startJewelExceptionalChance + this.endJewelExceptionalChance) / 2;
	}

	jewelNonExceptionalChance() {
		return 1 - this.jewelExceptionalChance();
	}

	jewelSuccessAndExceptionalChance() {
		return this.jewelSuccessChance() * this.jewelExceptionalChance();
	}

	jewelSuccessAndNonExceptionalChance() {
		return this.jewelSuccessChance() * this.jewelNonExceptionalChance();
	}

	jewelExceptionalChanceWithArtisan(artisanLevel) {
		const bonus = 0.05 + 0.015 * artisanLevel;
		return this.jewelExceptionalChance() * (1 + bonus);
	}

	jewelNonExceptionalChanceWithArtisan(artisanLevel) {
		return 1 - this.jewelExceptionalChanceWithArtisan(artisanLevel);
	}

	jewelSuccessAndExceptionalChanceWithArtisan(artisanLevel) {
		return this.jewelSuccessChance() * this.jewelExceptionalChanceWithArtisan(artisanLevel);
	}

	jewelSuccessAndNonExceptionalChanceWithArtisan(artisanLevel) {
		return this.jewelSuccessChance() * this.jewelNonExceptionalChanceWithArtisan(artisanLevel);
	}

	// STRINGS
	levelRangeString() {
		return `${this.startLevel} - ${this.endLevel + 0.1}`;
	}

	levelChanceString() {
		return percentString(this.levelChance);
	}

	ironSuccessChanceString() {
		return percentString(this.ironSuccessChance());
	}

	jewelSuccessChanceString() {
		return percentString(this.jewelSuccessChance());
	}

	jewelExceptionalChanceString() {
		return percentString(this.jewelExceptionalChance());
	}

	breakevenGemPriceString(ironPrice) {
		return `${this.breakevenGemPrice(ironPrice)} gold`;
	}

	breakevenGemPriceWithArtisanString(ironPrice, artisanLevel) {
		return `${this.breakevenGemPriceWithArtisan(ironPrice, artisanLevel)} gold`;
	}

	gemVendorPriceRatioString(ironPrice) {
		return `${Math.round(this.gemVendorPriceRatio(ironPrice) * 100)}%`;
	}
	gemVendorPriceRatioWithArtisanString(ironPrice, artisanLevel) {
		return `${Math.round(this.gemVendorPriceRatioWithArtisan(ironPrice, artisanLevel) * 100)}%`;
	}
}
