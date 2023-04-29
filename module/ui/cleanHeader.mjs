export default function()
{
	Hooks.on('renderApplication', clean);
	Hooks.on('renderDocumentSheet', clean);
	Hooks.on('renderActorSheet', clean);
	Hooks.on('renderJournalSheet', clean);
	Hooks.on('renderItemSheet', clean);
	Hooks.on('renderRollTableConfig', clean);
	Hooks.on('renderSidebarTab', clean);
	Hooks.on('renderFormApplication', clean);

}

export function handlePopout()
{
	if (game.modules.get("popout")) 
        Hooks.on('PopOut:loaded', cleanPoppedDocument);
}

function cleanPoppedDocument(app, poppedWindow) 
{
	if (poppedWindow === undefined)
		return;

	clean(app, $(poppedWindow));
}

function removeText(element)
{
	if (element.title === undefined || element.title.trim() === "")
		element.title = element.innerText?.trim();

	const nodeIterator = document.createNodeIterator(element, NodeFilter.SHOW_TEXT);
	let node = undefined;
	while (node = nodeIterator.nextNode()) {
		element.removeChild(node);
	}
}


function clean(app, html)
{
	if (html === undefined)
		return;

	// When using PopOut! module, button text is reset when you pop window in.
	// In this case, html is just form and not all window. So, we find parent window to get header section
	const header = ("form".localeCompare(html[0].tagName, undefined, { sensitivity: 'base' }) === 0)
		? html[0].parentElement.parentElement
		: html[0];

	const windowHeader = header.querySelector("header.window-header");
	if (windowHeader === null || windowHeader === undefined)
		return;

	setTimeout(() => {
		const headerButtons = windowHeader.querySelectorAll("a");
		if (headerButtons === null
			|| headerButtons === undefined
			|| (Array.isArray(headerButtons) && !headerButtons.length))
			return;

		for (let headerButton of headerButtons) 
		{
			removeText(headerButton);
		}
	}, 100);
}
