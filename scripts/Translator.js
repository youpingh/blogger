import { Glossary } from './Glossary.js';
/**
 * This is a translator utility to translate Chinese into English.
 */
export class Translator {

	static TRANSLATE_URL = 'https://key-manager-462519.uc.r.appspot.com/translate';
	// static TRANSLATE_URL = 'http://127.0.0.1:8080/translate';

	constructor() {
		this.model = "gpt-3.5-turbo";
		this.maxLength = 16000; // 16K tokens are about 12,000 -- 15,000 Chinese characters
	}

	static getInstance() {
		if (!Translator._instance) {
			Translator._instance = new Translator();
		}
		return Translator._instance;
	}

	/**
	 * Splits the input Chinese text to a few packages. Each of them is short than
	 * the max length the translator can handle (16K tokens)
	 * @param {*} useCache 
	 * @returns 
	 */
	static async translatePost(useCache) {
		const translator = Translator.getInstance();
		const cacheKey = 'blog_' + btoa(encodeURIComponent(window.location.hash));

		// find from localStorage
		const cached = localStorage.getItem(cacheKey);
		if (cached && useCache) {
			translator.createTranslatedPage(cached);
			return;
		}

		// clear the localStorage and translate it again
		if (cached) localStorage.removeItem(cacheKey);

		// translate the page and save the results to localStorage
		const blog = document.querySelector('.blog');
		const page = blog ? blog.outerHTML : '';
		const tokens = translator.estimateTokens(page);
		// console.log('code:', page, 'tokens:', tokens);
		let texts = '';
		let packages, translation;
		translator.showProgress();
		if (tokens > translator.maxLength) {
			packages = document.getElementsByClassName('package');
			for (let i = 0; i < packages.length; i++) {
				translation = await translator.translate(packages[i].innerHTML);
				if (translation.translated) {
					texts += translation.text;
				} else {
					texts = translation.text;
					break;
				}
			}
		} else {
			translation = await translator.translate(page);
			texts = translation.text;
		}

		if (translation.translated) {
			localStorage.setItem(cacheKey, texts);
		}

		translator.createTranslatedPage(texts);
		translator.hideProgress();
		return;
	}

	/**
	 * Translate a Chinese text string to English naturally and keep all the HTML structure unchanged, 
	 * only translate the text content. Skip the entire <head> tag. The input text must be shorter than
	 * 16K tokens (16K * 4 = 64K chars 32K Chinese characters).
	 * @param {*} text 
	 */
	async translate(text) {

		let translation = {
			translated: true,
			text: ''
		};

		// create a message with an instruction of the translation
		// use nature languare to create the instructions, OpenAI knows how to interprate.
		const glossary = Glossary.getCustomGlossary();
		const messages = [
			{
				role: "system",
				content: "You are a professional translator. Translate all visible Simplified Chinese text into natural English while preserving ALL HTML tags exactly as-is. Do not translate anything inside HTML tags. Do not translate tags themselves. Skip the <head> section completely. " + glossary
			},
			{
				role: "user",
				content: text
			}
		];

		try {
			const response = await fetch(TRANSLATE_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messages: messages,
					temperature: 0.3
				})
			});

			const data = await response.json();
			translation.translated = true;
			translation.text = data.choices[0].message.content;
		} catch (error) {
			translation.translated = false;
			translation.text = "Error: " + error.message;
		}
		return translation;
	}

	/**
	 * Replaces the page contents with the translated text
	 * @param {*} text 
	 * @returns 
	 */
	createTranslatedPage(text) {
		let pageContent = document.getElementById('page-content');
		pageContent.innerHTML = text;
		let blog = pageContent.querySelector('.blog');
		blog.className = 'blog-english';
	}

	/**
	 * Calculates the number of tokens of the text string.
	 * @param {*} text 
	 * @returns 
	 */
	estimateTokens(text) {
		const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
		const others = text.length - chineseChars;
		return chineseChars + others; //Math.ceil(others / 4);
	}

	/**
	 * Shows the progress spinner
	 */
	showProgress() {
		document.getElementById('progress-container').style.display = 'block';
	}

	/**
	 * Hides the progress spinner
	 */
	hideProgress() {
		document.getElementById('progress-container').style.display = 'none';
	}
}

window.Translator = Translator;
