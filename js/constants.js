// Bump this on each release to force cache reload of CSS/JS/images in production.
export const ASSET_VERSION = '1.9.0';

// Appends ?v=ASSET_VERSION to an asset path for cache-busting.
export function withVersion(path) {
    return `${path}?v=${ASSET_VERSION}`;
}

// Deluxe Paint II's default 256-color palette (DP.EXE, 1994).
//
// Lifted from a screenshot of DPaint's own Palette requester and verified
// against a second, independently-scaled rendering of the same palette. It is a
// 6-bit VGA DAC palette, so each channel below is an exact 6-bit value widened
// to 8-bit by bit replication ((v << 2) | (v >> 4)) — the same widening the
// screenshot used, which is how every entry could be recovered exactly rather
// than approximated.
//
// The layout is 16 ramps of 16. DPaint shows them as columns, so each line here
// is one column of its palette requester: the EGA 16 first, then a gray ramp,
// then hue ramps running light to dark. Indices 224-231 are black in DPaint
// itself — free slots, not a transcription error.
const DELUXE_PAINT_PALETTE = [
    '000000', '0000AA', '00AA00', '00AAAA', 'AA0000', 'AA00AA', 'AA5500', 'AAAAAA', '555555', '5555FF', '55FF55', '55FFFF', 'FF5555', 'FF55FF', 'FFFF55', 'FFFFFF',  //   0- 15  EGA 16
    'EFEFEF', 'DFDFDF', 'D3D3D3', 'C3C3C3', 'B6B6B6', 'AAAAAA', '9A9A9A', '8E8E8E', '7D7D7D', '717171', '656565', '555555', '494949', '383838', '2C2C2C', '202020',  //  16- 31  gray ramp
    'FF0000', 'EF0000', 'E30000', 'D70000', 'CB0000', 'BE0000', 'B20000', 'A60000', '9A0000', '8A0000', '7D0000', '710000', '650000', '590000', '4D0000', '410000',  //  32- 47  red
    'FFDBDB', 'FFBABA', 'FF9E9E', 'FF7D7D', 'FF5D5D', 'FF4141', 'FF2020', 'FF0000', 'FFAA5D', 'FF9A41', 'FF8A20', 'FF7900', 'E76D00', 'CF6100', 'B65500', '9E4D00',  //  48- 63  pink -> orange
    'FFFFDB', 'FFFFBA', 'FFFF9E', 'FFFF7D', 'FFFB5D', 'FFF741', 'FFF720', 'FFF700', 'E7DB00', 'CFC700', 'B6AE00', '9E9E00', '868600', '716D00', '595500', '414100',  //  64- 79  yellow
    'D3FF5D', 'C7FF41', 'B6FF20', 'A2FF00', '92E700', '82CF00', '75B600', '619E00', 'DBFFDB', 'BEFFBA', '9EFF9E', '82FF7D', '61FF5D', '41FF41', '20FF20', '00FF00',  //  80- 95  yellow-green / green
    '00FF00', '00EF00', '00E300', '00D700', '04CB00', '04BE00', '04B200', '04A600', '049A00', '048A00', '047D00', '047100', '046500', '045900', '044D00', '044100',  //  96-111  green
    'DBFFFF', 'BAFFFF', '9EFFFF', '7DFFFB', '5DFFFF', '41FFFF', '20FFFF', '00FFFF', '00E7E7', '00CFCF', '00B6B6', '009E9E', '008686', '007171', '005959', '004141',  // 112-127  cyan
    '5DBEFF', '41B2FF', '20AAFF', '009EFF', '008EE7', '007DCF', '006DB6', '005D9E', 'DBDBFF', 'BABEFF', '9E9EFF', '7D82FF', '5D61FF', '4141FF', '2024FF', '0004FF',  // 128-143  sky blue
    '0000FF', '0000EF', '0000E3', '0000D7', '0000CB', '0000BE', '0000B2', '0000A6', '00009A', '00008A', '00007D', '000071', '000065', '000059', '00004D', '000041',  // 144-159  blue
    'F3DBFF', 'E7BAFF', 'DB9EFF', 'D37DFF', 'CB5DFF', 'BE41FF', 'B620FF', 'AA00FF', '9A00E7', '8200CF', '7500B6', '61009E', '510086', '450071', '340059', '280041',  // 160-175  violet
    'FFDBFF', 'FFBAFF', 'FF9EFF', 'FF7DFF', 'FF5DFF', 'FF41FF', 'FF20FF', 'FF00FF', 'E300E7', 'CB00CF', 'B600B6', '9E009E', '860086', '6D0071', '590059', '410041',  // 176-191  magenta
    'FFEBDF', 'FFE3D3', 'FFDBC7', 'FFD7BE', 'FFCFB2', 'FFC7A6', 'FFBE9E', 'FFBA92', 'FFB282', 'FFA671', 'FF9E61', 'F3965D', 'EB8E59', 'DF8A55', 'D38251', 'CB7D4D',  // 192-207  peach
    'BE7949', 'B67145', 'AA6941', 'A2653C', '9E6138', '925D34', '8A5930', '82512C', '754D28', '6D4924', '5D4120', '553C1C', '493818', '413018', '382C14', '28200C',  // 208-223  brown
    '000000', '000000', '000000', '000000', '000000', '000000', '000000', '000000', 'C72828', 'C74D28', 'C77528', 'C79E28', 'C7C728', '9EC728', '75C728', '4DC728',  // 224-239  unused / green
    '28C730', '28C75D', '28C78A', '28C7B6', '28AAC7', '287DC7', '2851C7', '2C28C7', '5928C7', '8628C7', 'B228C7', 'C728AE', 'C72882', 'C72855', 'C72828', 'FFFFFF',  // 240-255  green -> blue -> red
];

// Fresh deep copy per call: Palette instances must not share color arrays.
export function generateDefaultPalette() {
    return DELUXE_PAINT_PALETTE.map(hex => [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
    ]);
}

export const DEFAULT_DOC_WIDTH = 320;
export const DEFAULT_DOC_HEIGHT = 200;

export const TRANSPARENT = 256; // sentinel value — not a valid palette index
export const ZOOM_LEVELS = [1, 2, 3, 4, 6, 8, 12, 16, 32];
export const GRID_MIN_ZOOM = 12;
