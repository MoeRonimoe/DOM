function handleFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = e.target.result; // Direkt das ArrayBuffer verwenden
            const jsonData = parseWAD(data);


            const levelnames = Object.keys(jsonData);

            levelnames.forEach(key => {
                $('#loaded_levels').append(`<a href="#" data-key="${key}" class="level-link">${key}</a>`);
            });

            $('.level-link').on('click', function() {
                const levelKey = $(this).data('key');
                loadLevel(jsonData[levelKey]).then((result) => {
                    $('#titlescreen').addClass("titlemelt").delay(2000).hide(0);
                }).catch((error) => {
                    console.error(error); // Falls ein Fehler auftritt
                });
            });

            console.log(jsonData);
            //document.getElementById('output').textContent = "Siehe Log!"; //JSON.stringify(jsonData, null, 2);
        };

        reader.readAsArrayBuffer(file); // ArrayBuffer direkt lesen
    }
}

function parseWAD(data) {
    const view = new DataView(data); // DataView für den ArrayBuffer erstellen

    const header = {
        identification: String.fromCharCode(
            view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)
        ),
        numEntries: view.getUint32(4, true),
        directoryOffset: view.getUint32(8, true),
    };

    const directory = [];
    for (let i = 0; i < header.numEntries; i++) {
        const entryOffset = header.directoryOffset + i * 16;
        const entry = {
            lumpOffset: view.getUint32(entryOffset, true),
            lumpSize: view.getUint32(entryOffset + 4, true),
            lumpName: String.fromCharCode(
                ...new Uint8Array(data.slice(entryOffset + 8, entryOffset + 16))
            ).replace(/\0/g, ''),
        };
        directory.push(entry);
    }

    // const lumpData = {};
    // for (const entry of directory) {
    // 	const lumpContent = data.subarray(entry.lumpOffset, entry.lumpOffset + entry.lumpSize);
    //     var lumpdata = parseLumpData(entry.lumpName, lumpContent);
    //     if(lumpdata != "") {
    //         lumpData[entry.lumpName] = parseLumpData(entry.lumpName, lumpContent);
    //     }
    // }
    //
    // const jsonData = {
    // 	//header,
    // 	//directory,
    // 	lumpData,
    // };
    //
    // return jsonData;


    // Gruppieren nach Level
    const levels = {};
    let currentLevel = null;

    for (const entry of directory) {
        // Prüfen, ob es ein Level-Marker ist
        if (isLevelMarker(entry.lumpName)) {
            currentLevel = entry.lumpName; // Neuer Level erkannt
            levels[currentLevel] = {};
        } else if (currentLevel) {
            // Lumps dem aktuellen Level zuordnen
            const lumpBuffer = data.slice(entry.lumpOffset, entry.lumpOffset + entry.lumpSize); // ArrayBuffer schneiden
            const lumpContent = new DataView(lumpBuffer); // DataView über den geschnittenen Bereich
            levels[currentLevel][entry.lumpName] = parseLumpData(entry.lumpName, lumpContent);
        }
    }

    return levels;
}


function isLevelMarker(lumpName) {
    // Erkennen von Level-Markern wie MAPxx, ExMx
    return /^MAP\d{2}$/.test(lumpName) || /^[E]\d[M]\d$/.test(lumpName);
}

// function parseLinedefs(lumpContent) {
//     const linedefArray = [];
//     const lumpView = new DataView(lumpContent.buffer);
//
//     const numLinedefs = lumpContent.byteLength / 14; // Jede Linedef hat 14 Bytes
//     for (let i = 0; i < numLinedefs; i++) {
//         const offset = i * 14;
//         const linedef = {
//             v1: lumpView.getUint16(offset, true).toString(),
//             v2: lumpView.getUint16(offset + 2, true).toString(),
//             flags: lumpView.getUint16(offset + 4, true).toString(),
//             specialType: lumpView.getUint16(offset + 6, true).toString(),
//             sectorTag: lumpView.getUint16(offset + 8, true).toString(),
//             sidefront: lumpView.getUint16(offset + 10, true).toString(),
//             sideback: lumpView.getUint16(offset + 12, true).toString()
//         };
//         linedefArray.push(linedef);
//     }
//
//     return linedefArray;
// }

function parsePlaypalLumpData(lumpContent) {
    // Hier implementieren Sie die Verarbeitung der playpal-Lump
    // Beispiel: Extrahiere Palette-Informationen
    const palette = [];
    for (let i = 0; i < lumpContent.byteLength; i += 3) {
        const color = {
            red: lumpContent[i],
            green: lumpContent[i + 1],
            blue: lumpContent[i + 2],
        };
        palette.push(color);
    }
    return palette;
}

function parseColormapLumpData(lumpContent) {
    // Hier implementieren Sie die Verarbeitung der colormap-Lump
    // Beispiel: Extrahiere colormap-Daten
    const colormap = [];
    for (let i = 0; i < lumpContent.byteLength; i++) {
        const value = lumpContent[i];
        colormap.push(value);
    }
    return colormap;
}

function parseEndoomLumpData(lumpContent) {
    // Hier implementieren Sie die Verarbeitung der endoom-Lump
    // Beispiel: Extrahiere Textinformationen
    return lumpContent.toString('utf-8');
}

function parseLumpData(lumpName, lumpContent) {
    switch (lumpName) {
        case 'THINGS':
            return parseThingsLumpData(lumpContent);
        case 'LINEDEFS':
            return parseLinedefsLumpData(lumpContent);
        case 'SIDEDEFS':
            return parseSidedefsLumpData(lumpContent);
        case 'VERTEXES':
            return parseVertexesLumpData(lumpContent);
        case 'SEGS':
            return parseSegsLumpData(lumpContent);
        case 'SSECTORS':
            return parseSsectorsLumpData(lumpContent);
        case 'NODES':
            return parseNodesLumpData(lumpContent);
        case 'SECTORS':
            return parseSectorsLumpData(lumpContent);
        case 'REJECT':
            return parseRejectLumpData(lumpContent);
        case 'BLOCKMAP':
            return parseBlockmapLumpData(lumpContent);
        case 'PLAYPAL':
            return parsePlaypalLumpData(lumpContent);
        case 'COLORMAP':
            return parseColormapLumpData(lumpContent);
        case 'ENDOOM':
            return parseEndoomLumpData(lumpContent);
        case "THING":
            return parsePlayerStart(lumpContent);
        // Andere Lump-Typen...
        default:
        //return lumpContent.toString('utf-8');
    }
}

function parsePlayerStart(lumpContent) {
    const playerStarts = [];
    const lumpView = new DataView(lumpContent.buffer);

    const numThings = lumpContent.byteLength / 10; // Jede Thing hat 10 Bytes
    for (let i = 0; i < numThings; i++) {
        const offset = i * 10;
        const thingType = lumpView.getUint16(offset + 6, true); // Typ des "Thing"

        // Prüfen, ob der Typ einem Spielerstart entspricht (z.B. 1, 2, 3 für verschiedene Spieler)
        if ([1, 2, 3, 4].includes(thingType)) {
            const playerStart = {
                xPosition: lumpView.getInt16(offset, true).toString(),
                yPosition: lumpView.getInt16(offset + 2, true).toString(),
                angle: lumpView.getUint16(offset + 4, true).toString(),
                playerType: thingType.toString() // Spieler 1 (Typ 1), Spieler 2 (Typ 2), usw.
            };
            playerStarts.push(playerStart);
        }
    }

    return playerStarts;
}

function parseThingsLumpData(lumpContent) {
    const things = [];
    for (let i = 0; i < lumpContent.byteLength; i += 10) {
        const thing = {
            xPosition: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            yPosition: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
            angle: new DataView(lumpContent.buffer, i + 4, 2).getInt16(0, true),
            thingType: new DataView(lumpContent.buffer, i + 6, 2).getUint16(0, true),
            flags: new DataView(lumpContent.buffer, i + 8, 2).getUint16(0, true),
        };
        things.push(thing);
    }
    return things;
}

function parseLinedefsLumpData(lumpContent) {
    const linedefs = [];
    for (let i = 0; i < lumpContent.byteLength; i += 14) {
        const linedef = {
            startVertex: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            endVertex: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
            flags: new DataView(lumpContent.buffer, i + 4, 2).getUint16(0, true),
            specialType: new DataView(lumpContent.buffer, i + 6, 2).getUint16(0, true),
            sectorTag: new DataView(lumpContent.buffer, i + 8, 2).getUint16(0, true),
            sidefront: new DataView(lumpContent.buffer, i + 10, 2).getUint16(0, true),
            sideback: new DataView(lumpContent.buffer, i + 12, 2).getUint16(0, true),
        };
        linedefs.push(linedef);
    }
    return linedefs;
}

function parseSidedefsLumpData(lumpContent) {
    const sidedefs = [];
    for (let i = 0; i < lumpContent.byteLength; i += 30) {
        const sidedef = {
            xOffset: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            yOffset: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
            upperTexture: String.fromCharCode.apply(
                null,
                new Uint8Array(lumpContent.buffer.slice(i + 4, i + 12))
            ).replace(/\0/g, ''),
            lowerTexture: String.fromCharCode.apply(
                null,
                new Uint8Array(lumpContent.buffer.slice(i + 12, i + 20))
            ).replace(/\0/g, ''),
            middleTexture: String.fromCharCode.apply(
                null,
                new Uint8Array(lumpContent.buffer.slice(i + 20, i + 28))
            ).replace(/\0/g, ''),
            sector: new DataView(lumpContent.buffer, i + 28, 2).getUint16(0, true),
        };
        sidedefs.push(sidedef);
    }
    return sidedefs;
}


function parseVertexesLumpData(lumpContent) {
    const vertexes = [];
    for (let i = 0; i < lumpContent.byteLength; i += 4) {
        const vertex = {
            x: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            y: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
        };
        vertexes.push(vertex);
    }
    return vertexes;
}

function parseSegsLumpData(lumpContent) {
    const segs = [];
    for (let i = 0; i < lumpContent.byteLength; i += 12) {
        const seg = {
            startVertex: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            endVertex: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
            angle: new DataView(lumpContent.buffer, i + 4, 2).getUint16(0, true),
            linedef: new DataView(lumpContent.buffer, i + 6, 2).getUint16(0, true),
            direction: new DataView(lumpContent.buffer, i + 8, 2).getUint16(0, true),
            offset: new DataView(lumpContent.buffer, i + 10, 2).getUint16(0, true),
        };
        segs.push(seg);
    }
    return segs;
}

function parseSsectorsLumpData(lumpContent) {
    const ssectors = [];
    for (let i = 0; i < lumpContent.byteLength; i += 4) {
        const ssector = {
            segCount: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            firstSeg: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
        };
        ssectors.push(ssector);
    }
    return ssectors;
}

function parseNodesLumpData(lumpContent) {
    const nodes = [];
    for (let i = 0; i < lumpContent.byteLength; i += 28) {
        // console.log("ROHDATEN: ",new Uint8Array(lumpContent.buffer, i, 28)); // Prüfen Sie die Rohdaten
        // Lade die Kinder als uint16 für eine korrekte Interpretation der Bits
        const rightChildRaw = new DataView(lumpContent.buffer, i + 16, 2).getUint16(0, true);
        const leftChildRaw = new DataView(lumpContent.buffer, i + 18, 2).getUint16(0, true);

        const isSubsector = (rightChildRaw & 0x8000) !== 0; // Höchstwertiges Bit prüfen
        const value = isSubsector ? {subsector: rightChildRaw & 0x7FFF} : rightChildRaw; // Maskierung
        console.log("VALUE ", value)
        console.log(`Raw Value: ${rightChildRaw}, Binary: ${rightChildRaw.toString(2).padStart(16, '0')}`);


        const node = {
            xPartition: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            yPartition: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
            changeX: new DataView(lumpContent.buffer, i + 4, 2).getInt16(0, true),
            changeY: new DataView(lumpContent.buffer, i + 6, 2).getInt16(0, true),
            rightBoundingBoxTop: new DataView(lumpContent.buffer, i + 8, 2).getInt16(0, true),
            rightBoundingBoxBottom: new DataView(lumpContent.buffer, i + 10, 2).getInt16(0, true),
            leftBoundingBoxTop: new DataView(lumpContent.buffer, i + 12, 2).getInt16(0, true),
            leftBoundingBoxBottom: new DataView(lumpContent.buffer, i + 14, 2).getInt16(0, true),

            // Prüfe das 15. Bit, um zu entscheiden, ob es ein Subnode oder Subsector ist
            rightChild: (rightChildRaw & 0x8000) === 0
                ? rightChildRaw // Subnode-Index (Bit 15 nicht gesetzt)
                : {subsector: rightChildRaw & 0x7FFF}, // Subsector-Nummer (untere 15 Bits)
            leftChild: (leftChildRaw & 0x8000) === 0
                ? leftChildRaw // Subnode-Index (Bit 15 nicht gesetzt)
                : {subsector: leftChildRaw & 0x7FFF}, // Subsector-Nummer (untere 15 Bits)

            rightBoundingBoxRight: new DataView(lumpContent.buffer, i + 20, 2).getInt16(0, true),
            rightBoundingBoxLeft: new DataView(lumpContent.buffer, i + 22, 2).getInt16(0, true),
            leftBoundingBoxRight: new DataView(lumpContent.buffer, i + 24, 2).getInt16(0, true),
            leftBoundingBoxLeft: new DataView(lumpContent.buffer, i + 26, 2).getInt16(0, true),
        };
        console.log("Raw RightChild:", rightChildRaw, "Processed:", node.rightChild);
        console.log("Raw LeftChild:", leftChildRaw, "Processed:", node.leftChild);

        nodes.push(node);
    }
    return nodes;
}

function parseSectorsLumpData(lumpContent) {
    const sectors = [];
    for (let i = 0; i < lumpContent.byteLength; i += 26) {
        const sector = {
            floorHeight: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            ceilingHeight: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
            floorTexture: String.fromCharCode.apply(
                null,
                new Uint8Array(lumpContent.buffer.slice(i + 4, i + 12))
            ).replace(/\0/g, ''),
            ceilingTexture: String.fromCharCode.apply(
                null,
                new Uint8Array(lumpContent.buffer.slice(i + 12, i + 20))
            ).replace(/\0/g, ''),
            lightLevel: new DataView(lumpContent.buffer, i + 20, 2).getUint16(0, true),
            specialType: new DataView(lumpContent.buffer, i + 22, 2).getUint16(0, true),
            tag: new DataView(lumpContent.buffer, i + 24, 2).getUint16(0, true),
        };
        sectors.push(sector);
    }
    return sectors;
}

function parseRejectLumpData(lumpContent) {
    const reject = [];
    const dataView = new DataView(lumpContent.buffer);

    // Parse Reject Data sicher
    for (let i = 0; i < lumpContent.byteLength; i += 2) {
        if (i + 2 > lumpContent.byteLength) {
            // console.error("Ungültiger Bereich für DataView bei Reject Lump!");
            break; // Schleife sicher beenden
        }
        reject.push(dataView.getInt16(i, true));
    }

    // Berechnung der Matrix-Größe überprüfen
    const numRows = Math.sqrt(reject.length);
    // if (!Number.isInteger(numRows)) {
    //     throw new Error("Die Länge von 'reject' ist keine perfekte Quadratzahl und kann nicht als Matrix interpretiert werden!");
    // }

    // Reject Matrix erstellen
    const rejectMatrix = [];
    for (let row = 0; row < numRows; row++) {
        const start = row * numRows;
        const end = start + numRows;
        rejectMatrix.push(reject.slice(start, end));
    }

    return rejectMatrix;
}


function parseBlockmapLumpData(lumpContent) {
    const blockmap = [];

    let offset = 0;

    // Parse Header
    const originX = new DataView(lumpContent.buffer, offset, 2).getInt16(0, true);
    offset += 2;
    const originY = new DataView(lumpContent.buffer, offset, 2).getInt16(0, true);
    offset += 2;
    const numColumns = new DataView(lumpContent.buffer, offset, 2).getUint16(0, true);
    offset += 2;
    const numRows = new DataView(lumpContent.buffer, offset, 2).getUint16(0, true);
    offset += 2;

    const numBlocks = numColumns * numRows;

    // Parse Offsets
    const blockOffsets = [];
    for (let i = 0; i < numBlocks; i++) {
        if (offset + 2 > lumpContent.byteLength) {
            console.error("Ungültiger Bereich für Blocklist-Offsets!");
            break;
        }
        const shortOffset = new DataView(lumpContent.buffer, offset, 2).getUint16(0, true);
        blockOffsets.push(shortOffset * 2); // Multiplizieren, um Byte-Offset zu erhalten
        offset += 2;
    }

    // Parse Blocks
    for (let i = 0; i < numBlocks; i++) {
        const blockOffset = blockOffsets[i];
        const blockList = [];
        if (blockOffset >= lumpContent.byteLength) {
            console.error(`Ungültiger Blocklist-Offset: ${blockOffset}`);
            continue; // Überspringe ungültige Offsets
        }

        let blockListOffset = blockOffset;
        while (true) {
            const linedefIndex = new DataView(lumpContent.buffer, blockListOffset, 2).getInt16(0, true);
            blockListOffset += 2;

            if (linedefIndex === -1) {
                break; // Ende der Blocklist erreicht
            }

            blockList.push(linedefIndex);
        }

        blockmap.push({
            x: originX + (i % numColumns), // Berechnung der X-Koordinate
            y: originY + Math.floor(i / numColumns), // Berechnung der Y-Koordinate
            linedefs: blockList,
        });
    }

    return blockmap;
}