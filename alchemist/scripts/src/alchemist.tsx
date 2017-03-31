
import { intent } from './intent/intent';

const values = ['', '+', '++', '+++', '^', '^^', '^^^'];
function evaluate(label, value) {
	return `${values[value]}${label}${values[value]}`;
}

class Ingredient {
	name: string;
	value: number;

	constructor(name: string, value: number = 0) {
		this.name = name;
		this.value = value;
	}

	toString() {
		return `'${evaluate(this.name, this.value)}'`;
	}

}

class Formula {
	name: string;
	value: number;
	ingredients: Ingredient[];

	constructor(name: string, value: number, ingredients: Ingredient[]) {
		this.name = name;
		this.ingredients = ingredients;
		this.value = value;
	}

	toString() {
		return `{ Formula "${evaluate(this.name, this.value)}" [${this.ingredients.join(', ')}]}`;
	}

}

class Event {

	constructor(public brew: Brew, public step: number) {}

}

class Brew {
	formula: Formula;
	environment: Environment;

	i = 0;

	constructor(formula: Formula, environment: Environment) {
		this.formula = formula;
		this.environment = environment;
	}

	done(): boolean {
		return this.i >= 5;
	}

	event() {
		return new Event(this, ++this.i);
	}

	toString() {
		return `< Brewing ${this.formula} in ${this.environment} >`;
	}
}

class Environment {

}

class Cauldron {
	name: string;
	environment: Environment;

	constructor(name: string) {
		this.name = name;
		this.environment = Alchemist.Environment();
	}

	put(ingredients: Ingredient[]): Formula {
		return Alchemist.Formula('Wild fire scroll', 2, ingredients);
	}

	brew(formula: Formula) {
		return Alchemist.Brew(formula, this.environment);
	}

	toString() {
		return `{ Cauldron "${this.name}" }`;
	}

}

const I = {
	ingredient: intent.type(Ingredient),
	ingredients: null,
	formula: intent.type(Formula),
	brew: null,
	event: intent.type(Event),
	environment: intent.type(Environment),
	cauldron: null,
};

I.ingredients = intent.array(I.ingredient);

I.brew = intent.describe(Brew, {
	constructor: {
		expects: [
			{formula: I.formula},
			{environment: I.environment},
		],
	},
	done: {
		returns: intent.boolean,
	},
	event: {
		returns: I.event,
	},
});

I.cauldron = intent.describe(Cauldron, {
	put: {
		expects: [
			{ingredients: I.ingredients},
		],

		returns: I.formula,
	},
	brew: {
		expects: [
			{formula: I.formula},
		],

		returns: I.brew,
	},
});


const Alchemist = {
	Ingredient: intent.bind(I.ingredient),
	Ingredients: intent.bind(I.ingredients),
	Formula: intent.bind(I.formula),
	Brew: intent.bind(I.brew),
	Environment: intent.bind(I.environment),
	Cauldron: intent.bind(I.cauldron),
};

let cauldron = Alchemist.Cauldron('Profound tier cauldron');
console.log(`Cauldron: ${cauldron}`);

let ingredient1 = Alchemist.Ingredient('Zhenshen', 1);
let ingredient2 = Alchemist.Ingredient('Lotus');
let ingredients = Alchemist.Ingredients(ingredient1, ingredient2);
console.log(`Ingredients: ${ingredients}`);

let formula = intent.call(cauldron).put(ingredients);
console.log(`Formula: ${formula}`);

let brew = intent.call(cauldron).brew(formula);
console.log(`Brew: ${brew}`);

