function handleFile(callback) {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    var jsonData = null;

    if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            jsonData = parseWAD(data);
            console.log(jsonData);

            $("#titlescreen").addClass("titlemelt").delay(2000).hide(0);
            callback(jsonData); // Pass jsonData to the callback function
        };

        reader.readAsArrayBuffer(file);
    }
}

function parseWAD(data) {
    const header = {
        identification: String.fromCharCode.apply(null, data.subarray(0, 4)),
        numEntries: new DataView(data.buffer, 4, 4).getUint32(0, true),
        directoryOffset: new DataView(data.buffer, 8, 4).getUint32(0, true),
    };

    const directory = [];
    for (let i = 0; i < header.numEntries; i++) {
        const entryOffset = header.directoryOffset + i * 16;
        if (new DataView(data.buffer, entryOffset + 4, 4).getUint32(0, true) == 0) {
            console.log(String.fromCharCode.apply(null, data.subarray(entryOffset + 8, entryOffset + 16)).replace(/\0/g, ''));
        }
        const entry = {
            lumpOffset: new DataView(data.buffer, entryOffset, 4).getUint32(0, true),
            lumpSize: new DataView(data.buffer, entryOffset + 4, 4).getUint32(0, true),
            lumpName: String.fromCharCode.apply(null, data.subarray(entryOffset + 8, entryOffset + 16)).replace(/\0/g, ''),
        };
        directory.push(entry);
    }

    const lumpData = {};
    for (const entry of directory) {
        const lumpContent = data.subarray(entry.lumpOffset, entry.lumpOffset + entry.lumpSize);
        lumpData[entry.lumpName] = parseLumpData(entry.lumpName, lumpContent);
    }

    const jsonData = {
        header,
        directory,
        lumpData,
    };

    return jsonData;
}

function parsePlaypalLumpData(lumpContent) {
    // Hier implementieren Sie die Verarbeitung der playpal-Lump
    // Beispiel: Extrahiere Palette-Informationen
    const palette = [];
    for (let i = 0; i < lumpContent.length; i += 3) {
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
    for (let i = 0; i < lumpContent.length; i++) {
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
        default:
            return lumpContent.toString('utf-8');
    }
}

function parseThingsLumpData(lumpContent) {
    const things = [];
    for (let i = 0; i < lumpContent.length; i += 10) {
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
    for (let i = 0; i < lumpContent.length; i += 14) {
        const linedef = {
            startVertex: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            endVertex: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
            flags: new DataView(lumpContent.buffer, i + 4, 2).getUint16(0, true),
            specialType: new DataView(lumpContent.buffer, i + 6, 2).getUint16(0, true),
            sectorTag: new DataView(lumpContent.buffer, i + 8, 2).getUint16(0, true),
            rightSidedef: new DataView(lumpContent.buffer, i + 10, 2).getUint16(0, true),
            leftSidedef: new DataView(lumpContent.buffer, i + 12, 2).getUint16(0, true),
        };
        linedefs.push(linedef);
    }
    return linedefs;
}

function parseSidedefsLumpData(lumpContent) {
    const sidedefs = [];
    for (let i = 0; i < lumpContent.length; i += 30) {
        const sidedef = {
            xOffset: new DataView(lumpContent.buffer, i, 2).getUint16(0, true),
            yOffset: new DataView(lumpContent.buffer, i + 2, 2).getUint16(0, true),
            upperTexture: String.fromCharCode.apply(null, lumpContent.subarray(i + 4, i + 12)).replace(/\0/g, ''),
            lowerTexture: String.fromCharCode.apply(null, lumpContent.subarray(i + 12, i + 20)).replace(/\0/g, ''),
            middleTexture: String.fromCharCode.apply(null, lumpContent.subarray(i + 20, i + 28)).replace(/\0/g, ''),
            sector: new DataView(lumpContent.buffer, i + 28, 2).getUint16(0, true),
        };
        sidedefs.push(sidedef);
    }
    return sidedefs;
}

function parseVertexesLumpData(lumpContent) {
    const vertexes = [];
    for (let i = 0; i < lumpContent.length; i += 4) {
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
    for (let i = 0; i < lumpContent.length; i += 12) {
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
    for (let i = 0; i < lumpContent.length; i += 4) {
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
    for (let i = 0; i < lumpContent.length; i += 28) {
        const node = {
            xPartition: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            yPartition: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
            changeX: new DataView(lumpContent.buffer, i + 4, 2).getInt16(0, true),
            changeY: new DataView(lumpContent.buffer, i + 6, 2).getInt16(0, true),
            rightBoundingBoxTop: new DataView(lumpContent.buffer, i + 8, 2).getInt16(0, true),
            rightBoundingBoxBottom: new DataView(lumpContent.buffer, i + 10, 2).getInt16(0, true),
            leftBoundingBoxTop: new DataView(lumpContent.buffer, i + 12, 2).getInt16(0, true),
            leftBoundingBoxBottom: new DataView(lumpContent.buffer, i + 14, 2).getInt16(0, true),
            rightChild: new DataView(lumpContent.buffer, i + 16, 2).getInt16(0, true),
            leftChild: new DataView(lumpContent.buffer, i + 18, 2).getInt16(0, true),
            rightBoundingBoxRight: new DataView(lumpContent.buffer, i + 20, 2).getInt16(0, true),
            rightBoundingBoxLeft: new DataView(lumpContent.buffer, i + 22, 2).getInt16(0, true),
            leftBoundingBoxRight: new DataView(lumpContent.buffer, i + 24, 2).getInt16(0, true),
            leftBoundingBoxLeft: new DataView(lumpContent.buffer, i + 26, 2).getInt16(0, true),
        };
        nodes.push(node);
    }
    return nodes;
}

function parseSectorsLumpData(lumpContent) {
    const sectors = [];
    for (let i = 0; i < lumpContent.length; i += 26) {
        const sector = {
            floorHeight: new DataView(lumpContent.buffer, i, 2).getInt16(0, true),
            ceilingHeight: new DataView(lumpContent.buffer, i + 2, 2).getInt16(0, true),
            floorTexture: String.fromCharCode.apply(null, lumpContent.subarray(i + 4, i + 12)).replace(/\0/g, ''),
            ceilingTexture: String.fromCharCode.apply(null, lumpContent.subarray(i + 12, i + 20)).replace(/\0/g, ''),
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
    for (let i = 0; i < lumpContent.length; i += 2) {
        reject.push(new DataView(lumpContent.buffer, i, 2).getInt16(0, true));
    }

    const numRows = Math.sqrt(reject.length);
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
    const xCoordinates = [];
    const yCoordinates = [];
    const linedefs = [];

    let offset = 0;

    // Parse X Coordinates
    for (let i = 0; i < lumpContent.length / 2; i++) {
        xCoordinates.push(new DataView(lumpContent.buffer, offset, 2).getUint16(0, true));
        offset += 2;
    }

    // Parse Y Coordinates
    for (let i = 0; i < lumpContent.length / 2; i++) {
        yCoordinates.push(new DataView(lumpContent.buffer, offset, 2).getUint16(0, true));
        offset += 2;
    }

    // Parse Linedefs
    for (let i = 0; i < lumpContent.length / 2; i++) {
        linedefs.push(new DataView(lumpContent.buffer, offset, 2).getUint16(0, true));
        offset += 2;
    }

    // Build Blockmap Data Structure
    const numRows = Math.sqrt(xCoordinates.length);
    for (let row = 0; row < numRows; row++) {
        const blockmapRow = [];
        for (let col = 0; col < numRows; col++) {
            const index = row * numRows + col;
            const block = {
                x: xCoordinates[index],
                y: yCoordinates[index],
                linedefs: linedefs[index],
            };
            blockmapRow.push(block);
        }
        blockmap.push(blockmapRow);
    }

    return blockmap;
}