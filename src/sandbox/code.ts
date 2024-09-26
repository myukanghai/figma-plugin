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

let defaultFont = "NanumR";

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
		let nodes: any[] = [];
		recursiveFindNodeStartWith("d-", figma.currentPage.selection, nodes);
		//iterate over the result and print the name, x and y
		let pageResult: Page = {
			pdf: figma.currentPage.selection[0].name + ".pdf",
			placeHolders: {},
		};

		let templateResult: DataMapperPage = {
			pageName: 	figma.currentPage.selection[0].name,
			data: {},
		}

		for (let node of nodes) {
			console.log(node);
			const objectType = node.name.split("-")[2];

			let option = {};

			if (objectType === "dynamicRect") {
				let labelFont = defaultFont;
				if (node?.fontName?.family == "Pretendard Variable") {
					if (node.fontName.style == "Regular") {
						labelFont = "PretendardR";
					} else if (node.fontName.style == "Bold") {
						labelFont = "PretendardB";
					} else if (node.fontName.style == "SemiBold") {
						labelFont = "PretendardSB";
					}
				} else if (node?.fontName?.family == "Lato") {
					labelFont = "Lato" + "-" + node.fontName.style;
				}

				let isRounded = false;
				let round = 0;
				if (node.cornerRadius != 0) {
					isRounded = true;
					round = 1
				}
				option = {
					width: node.width * PdfA4PtToMm_X,
					height: node.height * PdfA4PtToMm_Y,
				};
				if (isRounded) {
					option = {
						...option,
						isRounded,
						round,
						labelFont,
						labelSize: 6
					}
				}
			} else if (objectType === "rect") {
				let isRounded = false;
				let round = 0;
				if (node.cornerRadius != 0) {
					isRounded = true;
					round = 1
				}

				let labelFont = defaultFont;
				if (node?.fontName?.family == "Pretendard Variable") {
					if (node.fontName.style == "Regular") {
						labelFont = "PretendardR";
					} else if (node.fontName.style == "Bold") {
						labelFont = "PretendardB";
					} else if (node.fontName.style == "SemiBold") {
						labelFont = "PretendardSB";
					}
				} else if (node?.fontName?.family == "Lato") {
					labelFont = "Lato" + "-" + node.fontName.style;
				}


				option = {
					...isRounded && { isRounded, round },
					width: node.width * PdfA4PtToMm_X,
					height: node.height * PdfA4PtToMm_Y,
					R: Math.round(node.fills[0].color.r * 255),
					G: Math.round(node.fills[0].color.g * 255),
					B: Math.round(node.fills[0].color.b * 255),
					labelFont: labelFont
				};
			} else if (objectType ==="textV2") {

				let lineHeight = 0

				if (node?.lineHeight.unit == "PIXELS") {
					lineHeight = node?.lineHeight.value * PdfA4PtToMm_Y;
				}

				if (node?.lineHeight.unit == "PERCENT") {
					lineHeight = node?.lineHeight.value * node?.fontSize / 100 * PdfA4PtToMm_Y;
				}

				let font = "PretendardR";
				if (node?.fontName?.family == "Pretendard Variable") {
					if (node.fontName.style == "Regular") {
						font = "PretendardR";
					} else if (node.fontName.style == "Bold") {
						font = "PretendardB";
					} else if (node.fontName.style == "SemiBold") {
						font = "PretendardSB";
					}
				} else if (node?.fontName?.family == "Lato") {
					font = "Lato" + "-" + node.fontName.style;
				}

				let hoAlign = "L";
				if (node?.textAlignHorizontal == "LEFT") {
					hoAlign = "L";
				} else if (node?.textAlignHorizontal == "CENTER") {
					hoAlign = "C";
				} else if (node?.textAlignHorizontal == "RIGHT") {
					hoAlign = "R";
				}

				let veAlign = "T";
				if (node?.textAlignVertical == "TOP") {
					veAlign = "T";
				} else if (node?.textAlignVertical == "CENTER") {
					veAlign = "M";
				} else if (node?.textAlignVertical == "BOTTOM") {
					veAlign = "B";
				} else if (node?.textAlignVertical == "BASELINE") {
					veAlign = "A";
				}


				option = {
					R: Math.round(node.fills[0].color.r * 255),
					G: Math.round(node.fills[0].color.g * 255),
					B: Math.round(node.fills[0].color.b * 255),

					width: node.width * PdfA4PtToMm_X,
					height: lineHeight ,
					size: node.fontSize,
					font: font,
					align: hoAlign + veAlign,
				};
			} else if (objectType === "text") {
				let font = "PretendardR";
				if (node?.fontName?.family == "Pretendard Variable") {
					if (node.fontName.style == "Regular") {
						font = "PretendardR";
					} else if (node.fontName.style == "Bold") {
						font = "PretendardB";
					} else if (node.fontName.style == "SemiBold") {
						font = "PretendardSB";
					}
				} else if (node?.fontName?.family == "Lato") {
					font = "Lato" + "-" + node.fontName.style;
				}

				let hoAlign = "L";
				if (node?.textAlignHorizontal == "LEFT") {
					hoAlign = "L";
				} else if (node?.textAlignHorizontal == "CENTER") {
					hoAlign = "C";
				} else if (node?.textAlignHorizontal == "RIGHT") {
					hoAlign = "R";
				}

				let veAlign = "T";
				if (node?.textAlignVertical == "TOP") {
					veAlign = "T";
				} else if (node?.textAlignVertical == "CENTER") {
					veAlign = "M";
				} else if (node?.textAlignVertical == "BOTTOM") {
					veAlign = "B";
				} else if (node?.textAlignVertical == "BASELINE") {
					veAlign = "A";
				}


				option = {
					width: node.width * PdfA4PtToMm_X,
					size: node.fontSize,
					font: font,
					align: hoAlign + veAlign,
				};
			} else if (objectType === "radarV2") {
				option = {
					canvasWidth: node.width * PdfA4PtToMm_X,
					canvasHeight: node.height * PdfA4PtToMm_Y,
					sideLength: node.width * PdfA4PtToMm_X,
					levels: node.children.length,
				}
			} else {
			  option = {}
			}

			pageResult.placeHolders[node.name] = {
				X: node.x * PdfA4PtToMm_X,
				Y: node.y * PdfA4PtToMm_Y,
				type: objectType,
				option: option,
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
	} else if (msg.type === 'simple-replacer') {
		const origin = msg.data.origin;
		const tobe = msg.data.tobe;

		// iterate over all the nodes in the selection
		for (const node of figma.currentPage.selection) {
			// if the node is a text node
			recursiveChangeName(node, origin, tobe);
		}
	} else if (msg.type==="default-font-selector") {
		defaultFont = msg.data.font;
	} else if (msg.type === "node-selector") {
		// iterate over all the nodes in the selection
			// remember the current selection
			const cur = figma.currentPage.selection[0];

			recursiveAddSelectNode(msg.data.node, cur, figma.currentPage.selection);

			// select the nodes
			figma.currentPage.selection = [...figma.currentPage.selection];
	}
};

function recursiveAddSelectNode(token: string, node:  SceneNode, resultArr: any): any {
	if (node.name.includes(token)) {
		resultArr.push(node);
	}
	if ("children" in node) {
		for (let child of node.children) {
			recursiveAddSelectNode(token, child, resultArr);
		}
	}
}

// recursively get children of a node and change the name of the node by original to be
function recursiveChangeName(node: SceneNode, origin: string, tobe: string) {
	if (node.name.includes(origin)) {
		node.name = node.name.replace(origin, tobe);
	}
	if ("children" in node) {
		for (let child of node.children) {
			recursiveChangeName(child, origin, tobe);
		}
	}
}