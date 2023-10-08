export const BLACK   = 0x00;
export const WHITE   = 0x01;
export const RED     = 0x02;
export const CYAN    = 0x03;
export const PURPLE  = 0x04;
export const GREEN   = 0x05;
export const BLUE    = 0x06;
export const YELLOW  = 0x07;

export const symmetries = [
  'Single',
  'Double',
  'Triple',
  'Quad',
];

let RGBs = {
  0x00: [0,0,0,255],
  0x01: [255,255,255,255],
  0x02: [255,10,0,255],
  0x03: [10,255,255,255],
  0x04: [128,10,128,255],
  0x05: [0,128,10,255],
  0x06: [0,10,255,255],
  0x07: [255,255,10,255],
};

export function updateColorScheme() {
  for (var i=1;i<7; i++) {
    let ni = Math.floor(Math.random() * (allRGBs.length));
    RGBs[i] = allRGBs[ni];
  }
  return RGBs;
}

const allRGBs = [
[128,0,0,255],
[139,0,0,255],
[165,42,42,255],
[178,34,34,255],
[220,20,60,255],
[255,0,0,255],
[255,99,71,255],
[255,127,80,255],
[205,92,92,255],
[240,128,128,255],
[233,150,122,255],
[250,128,114,255],
[255,160,122,255],
[255,69,0,255],
[255,140,0,255],
[255,165,0,255],
[255,215,0,255],
[184,134,11,255],
[218,165,32,255],
[238,232,170,255],
[189,183,107,255],
[240,230,140,255],
[128,128,0,255],
[255,255,0,255],
[154,205,50,255],
[85,107,47,255],
[107,142,35,255],
[124,252,0,255],
[127,255,0,255],
[173,255,47,255],
[0,100,0,255],
[0,128,0,255],
[34,139,34,255],
[0,255,0,255],
[50,205,50,255],
[144,238,144,255],
[152,251,152,255],
[143,188,143,255],
[0,250,154,255],
[0,255,127,255],
[46,139,87,255],
[102,205,170,255],
[60,179,113,255],
[32,178,170,255],
[47,79,79,255],
[0,128,128,255],
[0,139,139,255],
[0,255,255,255],
[0,255,255,255],
[224,255,255,255],
[0,206,209,255],
[64,224,208,255],
[72,209,204,255],
[175,238,238,255],
[127,255,212,255],
[176,224,230,255],
[95,158,160,255],
[70,130,180,255],
[100,149,237,255],
[0,191,255,255],
[30,144,255,255],
[173,216,230,255],
[135,206,235,255],
[135,206,250,255],
[25,25,112,255],
[0,0,128,255],
[0,0,139,255],
[0,0,205,255],
[0,0,255,255],
[65,105,225,255],
[138,43,226,255],
[75,0,130,255],
[72,61,139,255],
[106,90,205,255],
[123,104,238,255],
[147,112,219,255],
[139,0,139,255],
[148,0,211,255],
[153,50,204,255],
[186,85,211,255],
[128,0,128,255],
[216,191,216,255],
[221,160,221,255],
[238,130,238,255],
[255,0,255,255],
[218,112,214,255],
[199,21,133,255],
[219,112,147,255],
[255,20,147,255],
[255,105,180,255],
[255,182,193,255],
[255,192,203,255],
[250,235,215,255],
[245,245,220,255],
[255,228,196,255],
[255,235,205,255],
[245,222,179,255],
[255,248,220,255],
[255,250,205,255],
[250,250,210,255],
[255,255,224,255],
[139,69,19,255],
[160,82,45,255],
[210,105,30,255],
[205,133,63,255],
[244,164,96,255],
[222,184,135,255],
[210,180,140,255],
[188,143,143,255],
[255,228,181,255],
[255,222,173,255],
[255,218,185,255],
[255,228,225,255],
[255,240,245,255],
[250,240,230,255],
[253,245,230,255],
[255,239,213,255],
[255,245,238,255],
[245,255,250,255],
[112,128,144,255],
[119,136,153,255],
[176,196,222,255],
[230,230,250,255],
[255,250,240,255],
[240,248,255,255],
[248,248,255,255],
[240,255,240,255],
[255,255,240,255],
[240,255,255,255],
[255,250,250,255],
[0,0,0,255],
[105,105,105,255],
[128,128,128,255],
[169,169,169,255],
[192,192,192,255],
[211,211,211,255],
[220,220,220,255],
[245,245,245,255],
[255,255,255,255],

];

