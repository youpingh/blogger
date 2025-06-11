import { AllPosts } from './AllPosts.js';

/**
 * This is a sidebar utility to create a sidebar with a TOC.
 */
export class Sidebar {

	constructor() {
	}

	static getInstance() {
		if (!Sidebar._instance) {
			Sidebar._instance = new Sidebar();
		}
		return Sidebar._instance;
	}

	/**
	 * Creates a TOC in the sidebar.
	 */
	static createTOCs() {
		const sidebar = this.getInstance();
		for (let i = 1; i < 3; i++) {
			const category = 'afanti' + i;
			const toc = document.getElementById(category);
			const tocList = toc.querySelectorAll('ul');
			if (tocList && tocList.length > 0) {
				continue;
			}
			const categoryPosts = AllPosts.ALL_POSTS.filter(item => (item.src.includes(category) && item.show));
			const posts = categoryPosts.map(item => item.src);
			const groups = sidebar.createGroups(posts);
			const labels = Object.keys(groups);
			let show = false;

			for (let j = 0; j < labels.length; j++) {
				show = (j == 0 && i == 2 ? true : false);
				sidebar.createLabelTOC(category, labels[j], groups[labels[j]], show);
			}
		}
	}

	/**
	 * Shows or hides the posts for the specified lable
	 */
	static showPostLabels(label) {
		const ulid = 'ul-' + label;
		let ul = document.getElementById(ulid);
		if (ul.style.display === 'none') {
			ul.style.display = 'block';
		} else {
			ul.style.display = 'none';
		}
	}

	/**
	 * Creates a list of titles grouped by label
	 * https://host/#afanti2/label/title
	 * @param {*} posts 
	 * @returns 
	 */
	createGroups(posts) {
		const groups = {};
		posts.forEach(path => {
			const parts = path.split('/');
			const key = parts[5]; // 6th item
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(parts[6]);
		});
		return groups;
	}

	/**
	 * Create a TOC for the specified label
	 * @param {*} category 
	 * @param {*} label 
	 * @param {*} posts 
	 */
	createLabelTOC(category, label, posts, show) {
		let toc = document.getElementById(category);
		let p, ul, li, link;

		// create a <p> element for the label
		p = document.createElement('p');
		p.id = label;
		p.textContent = '+ ' + label;
		p.title = 'Click to expand/hide';
		p.className = 'sidebar-label';
		p.onclick = function () { Sidebar.showPostLabels(this.id); };
		toc.appendChild(p);

		// create a UL element and a list of LI elements for the post titles
		ul = document.createElement('ul');
		ul.id = 'ul-' + label;
		ul.className = 'sidebar-post';
		ul.style.display = (show ? 'block' : 'none');

		for (let i = 0; i < posts.length; i++) {
			link = '<a href="#' + category + '/' + label + '/' + posts[i] + '">' + posts[i] + '</a>';
			li = document.createElement('li');
			li.innerHTML = link;
			ul.appendChild(li);
		}
		toc.appendChild(ul);
		// console.log(bookIdx.innerHTML);
	}
}

window.Sidebar = Sidebar;
