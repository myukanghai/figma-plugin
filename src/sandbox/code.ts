// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// for (let node = figma.currentPage.children.length - 1; node >= 0; node--) {
//   console.log(figma.currentPage.children[node], figma.currentPage.children[node].name)
// }

import { PdfA4PtToMm_X, PdfA4PtToMm_Y } from "./constant/pdf";

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 500, height: 800 });

function recursiveFindNodeStartWith(
	token: string,
	parent: readonly SceneNode[],
	result: any[] = []
): any {
	for (const node of parent) {
		if (node.name.startsWith(token)) {
			result.push(node);
		}
		if ("children" in node) {
			recursiveFindNodeStartWith(token, node.children, result);
		}
	}
}

// export the current selection object x, y, width, height
figma.on("selectionchange", () => {
	console.log(figma.currentPage.selection[0])
	if (figma.currentPage.selection.length === 0) {

		figma.ui.postMessage({
			pluginMessage: {
				type: "selection-change",
				data: {
					x: 0,
					y: 0,
					width: 0,
					height: 0,
				},
			},
		});
	} else if (figma.currentPage.selection[0].type === "FRAME") {
		//
		var nodes: any[] = [];
		recursiveFindNodeStartWith("d-", figma.currentPage.selection, nodes);
		//iterate over the result and print the name, x and y
		var pageResult: Page = {
			pdf: figma.currentPage.selection[0].name + ".pdf",
			placeHolders: {},
		};

		var templateResult: DataMapperPage = {
			pageName: 	figma.currentPage.selection[0].name,
			data: {},
		}

		for (let node of nodes) {
			console.log(node);
			const objectType = node.name.split("-")[2];
			pageResult.placeHolders[node.name] = {
				X: node.x * PdfA4PtToMm_X,
				Y: node.y * PdfA4PtToMm_Y,
				type: objectType,
				option: {},
			};

			templateResult.data[node.name] = {};
		}

		// post message
		figma.ui.postMessage({
			pluginMessage: {
				type: "render-pdfObjects",
				data: pageResult,
			},
		});

		figma.ui.postMessage({
			pluginMessage: {
				type: "render-dataMapper",
				data: templateResult,
			},
		});

		figma.ui.postMessage({
			pluginMessage: {
				type: "selection-change",
				data: {
					xy: {
						X: figma.currentPage.selection[0].x * PdfA4PtToMm_X,
						Y: figma.currentPage.selection[0].y * PdfA4PtToMm_Y,
					},
					widthHeight: {
						width: figma.currentPage.selection[0].width * PdfA4PtToMm_X,
						height: figma.currentPage.selection[0].height * PdfA4PtToMm_Y,
					}
				},
			},
		});
	} else {
		figma.ui.postMessage({
			pluginMessage: {
				type: "selection-change",
				data: {
					xy: {
						X: figma.currentPage.selection[0].x * PdfA4PtToMm_X,
						Y: figma.currentPage.selection[0].y * PdfA4PtToMm_Y,
					},
					widthHeight: {
						width: figma.currentPage.selection[0].width * PdfA4PtToMm_X,
						height: figma.currentPage.selection[0].height * PdfA4PtToMm_Y,
					}
				},
			},
		});
	}
})

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
	if (msg.type === "export-pdf") {
		if (figma.currentPage.selection.length === 0) {
			figma.notify("Export할 최소 1개의 프레임을 선택해주세요.");
		}
		const pdf = await figma.currentPage.selection[0].exportAsync({
			format: "PDF",
		});

		// compress pdf
		figma.ui.postMessage({
			pluginMessage: {
				type: "download-pdf",
				data: { bytes: pdf, name: figma.currentPage.selection[0].name },
			},
		});
	} else if (msg.type === "export-json") {
		if (figma.currentPage.selection.length === 0) {
			figma.notify("Export할 최소 1개의 프레임을 선택해주세요.");
		}
	}
};
