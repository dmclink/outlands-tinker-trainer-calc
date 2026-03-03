const Material = Object.freeze({
	IRON: 'iron',
	CITRINE: 'citrine',
	TOURMALINE: 'tourmaline',
	AMBER: 'amber',
	AMETHYST: 'amethyst',
	RUBY: 'ruby',
	SAPPHIRE: 'sapphire',
	EMERALD: 'emerald',
	STAR_SAPPHIRE: 'star sapphire',
	DIAMOND: 'diamond',
});

const GemVendorPrice = Object.freeze({
	[Material.CITRINE]: 20,
	[Material.TOURMALINE]: 30,
	[Material.AMBER]: 40,
	[Material.AMETHYST]: 50,
	[Material.RUBY]: 60,
	[Material.SAPPHIRE]: 70,
	[Material.EMERALD]: 80,
	[Material.STAR_SAPPHIRE]: 90,
	[Material.DIAMOND]: 100,
});

export { Material, GemVendorPrice };
