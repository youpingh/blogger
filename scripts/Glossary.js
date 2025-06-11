/**
 * This is a common glossary used by the translator.
 */
export class Glossary {

	constructor() {
		this.glossary = {
			"博主": "blogger",
			"躺平": "opt out quietly",
			"内卷": "cutthroat competition",
			"打工人": "working-class hero",
			"凡尔赛": "humblebrag",
			"吃瓜": "watch the drama unfold",
		};

		this.commonGlossary = Glossary.buildCommonGlossary(this.glossary);
	}

	static getInstance() {
		if (!Glossary._instance) {
			Glossary._instance = new Glossary();
		}
		return Glossary._instance;
	}

	static buildCommonGlossary(glossary) {
		let result = "Use the following translations for slang and idioms:\n\n";
		for (const [key, value] of Object.entries(glossary)) {
			result += `"${key}" => "${value}"\n`;
		}
		return result;
	}

	static getCommonGlossary() {
		const glossary = Glossary.getInstance();
		return glossary.commonGlossary;
	}

	static getCustomGlossary() {
		let commonGlossary = Glossary.getCommonGlossary();
		let customGlossary = '';
		const glossaryElement = document.getElementById('glossary');
		if (glossaryElement) {
			customGlossary = glossaryElement.textContent;
		}
		return commonGlossary + customGlossary;
	}
}

window.Glossary = Glossary;
