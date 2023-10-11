# psychedelia.large

A subset of [Psychedelia](https://github.com/mwenge/psychedelia) ported to Javascript and adapted for the big screen.

See also [Psychedelia.js](https://github.com/mwenge/psychedelia.js)

Specifically this is an adaptation in Javascript of the version of Psychedelia
that appeared as a [type-in listing in 'Popular Computing Magazine' in December
1984](https://github.com/mwenge/psychedelia-listing):

<img height=360 src="https://github.com/mwenge/psychedelia-listing/raw/master/listing/PopularComputing_Weekly_Issue_1984-12-13_0031.jpg"><img height=360 src="https://github.com/mwenge/psychedelia-listing/raw/master/listing/PopularComputing_Weekly_Issue_1984-12-13_0033.jpg">

Like all type-in listings of its day this consisted of a small BASIC program
that loads the raw machine code into memory. The juice of the program therefore
is not in the short human-readable preamble at the start of the listing:

```basic
10 REM *** A JEFF MINTER PRODUCTION ***
20 REM *** BASIC PROG. BY KEVIN BERGIN ***
30 REM *** ENTER THE FOLLOWING IN DIREC T MODE BEFORE YOU START!! ***
40 REM *** POKE 43,1:POKE 44,44:POKE 16 384,0:CLR:NEW ***
50 PRINT"HANG ON A SEC."
60 POKE53281 ,0:POKE53280,0:FORA=2049TO3457
70 READX: J=J+X:POKEA,X
80 NEXT: IFJ<>98035THEN180
90 PRINT" WONDERFUL COLOURS COMING..."
100 PRINT"&& BUT FIRST HAVE YOU SAVED THIS ?"
110 GETA$: IFA$<>"V"ANDA$<>"N"THEN110
120 IFA$="N"THENPRINT"SAVE IT NOW THEN": STOP
130 PRINT "TO SAVE THE CODE": PRINT"PRESS RUN/STOP & RESTORE"
140 PRINT"THEN SAVE AS NORMAL (THAT IS AFTER YOU EXIT THIS PROG"
150 POKE198,0:PRINT"PRESS A KEY TO START. ":WAIT198,1
160 PRINT"CLR: NEW": PRINT" S2PP43, 11P (744,8":PRINT"ERUN" 3 CHRS (19)
170 POKE631,13: POKE632,13: POKE633,13:POKE198,3:END
180 PRINT"DATA ERROR TRY AGAIN!"
```

This just performs the mundane task of reading in all of the numbers in the
rest of the listing and, once done, executing those numbers as a machine code
program. Rather what we're interested in is the assembly instructions that
underlie that long list of numbers. For example:

![snippet](https://github.com/mwenge/psychedelia.js/assets/58846/5e443a03-cede-4a90-b2b1-81c71a9d415d)

To give you an idea of how we get from raw numbers to an assembly program in practice I'll show you how
a little routine I call `PaintPixel` appears in the listing. Here it is:

```
410 DATA                165,2
420 DATA 41,128,208,249,165,2,201
430 DATA 40,16,243,165,3,41,128
440 DATA 208,237,165,3,201,24,16
450 DATA 231,32,92,64,177,5,41
460 DATA 7,162,0,221,84,64,240
470 DATA 5,232,224,8,208,246,138
480 DATA 133,253,166,4,232,228,253
490 DATA 240,3,16,1,96,166,4
500 DATA 189,84,64,145,5,96   
```

If you read left to right below, you can see the decimal values given in the listing translated to
hexadecimal, then to the meaning of those hexadecimal values in 6502 assembly language.

```asm
Decimal                                    Pretty  Assembly
Data          Hex         Assembly         with labels
-------       --------    ------------     ------------------------------------------------
                                           PaintPixel                                       
165 2         a5 02       lda $02                  LDA pixelXPosition                               
41 128        29 80       and #$80                 AND #$80 ; Detect if has moved off left of screen
208 249       d0 f9       bne $089f                BNE ReturnEarly                                  
165 2         a5 02       lda $02                  LDA pixelXPosition                               
201 40        c9 28       cmp #$28                 CMP #NUM_COLS                                    
16 243        10 f3       bpl $089f                BPL ReturnEarly                                  
165 3         a5 03       lda $03                  LDA pixelYPosition                               
41 128        29 80       and #$80                 AND #$80 ; Detect if has moved off top of screen.
208 237       d0 ed       bne $089f                BNE ReturnEarly                                  
165 3         a5 03       lda $03                  LDA pixelYPosition                               
201 24        c9 18       cmp #$18                 CMP #NUM_ROWS                                    
16 231        10 e7       bpl $089f                BPL ReturnEarly                                  
32 145 8      20 91 08    jsr $0891                JSR LoadXAndYPosition                            
177 5         b1 05       lda ($05),y              LDA (currentLineForPixelInColorRamLoPtr),Y       
41 7          29 07       and #$07                 AND #COLOR_MAX                                   
162 0         a2 00       ldx #$00                 LDX #$00                                         
221 137 8     dd 89 08    cmp $0889,x      b408C   CMP presetColorValuesArray,X             
240 5         f0 05       beq $08cb                BEQ b4096                                        
232           e8          inx                      INX                                              
224 8         e0 08       cpx #$08                 CPX #COLOR_MAX + 1                               
208 246       d0 f6       bne $08c1                BNE b408C                                        
138           8a          txa              b4096   TXA                                      
133 253       85 fd       sta $fd                  STA indexOfCurrentColor                          
166 4         a6 04       ldx $04                  LDX colorIndexForCurrentPixel                    
232           e8          inx                      INX                                              
228 253       e4 fd       cpx $fd                  CPX indexOfCurrentColor                          
240 3         f0 03       beq $08d8                BEQ ActuallyPaintPixel                           
16 1          10 01       bpl $08d8                BPL ActuallyPaintPixel                           
96            60          rts                      RTS                                              
                                           ActuallyPaintPixel                               
166 4         a6 04       ldx $04                  LDX colorIndexForCurrentPixel                    
189 137 8     bd 89 08    lda $0889,x              LDA presetColorValuesArray,X                     
145 5         91 05       sta ($05),y              STA (currentLineForPixelInColorRamLoPtr),Y       
96            60          rts                      RTS                               
```

And this is what `PaintPixel` looks like when we port it from assembly to Javascript:
```asm
6502 Assembly Language                                 Javascript
;-----------------------                               -------------
PaintPixel                                             function paintPixel(pixelXPos, pixelYPos, colorIndexForCurrentPixel) {                              
  LDA pixelXPosition                                     if (pixelXPos < 0) {
  AND #$80 ; Detect if has moved off left of screen        return;
  BNE ReturnEarly                                        }

  LDA pixelXPosition                                     if (pixelXPos >= NUM_COLS) {
  CMP #NUM_COLS                                            return;
  BPL ReturnEarly                                        }

  LDA pixelYPosition                                     if (pixelYPos < 0) {
  AND #$80 ; Detect if has moved off top of screen.        return;
  BNE ReturnEarly                                        }

  LDA pixelYPosition                                     if (pixelYPos >= NUM_ROWS) {
  CMP #NUM_ROWS                                            return;
  BPL ReturnEarly                                        }
                                                                                                                                                          
  JSR LoadXAndYPosition                                  const x = (pixelYPos * NUM_COLS) + pixelXPos;

  ; Y now contains the pixelXPosition                    const currentColorForPixel = pixel_matrix[x] & COLOR_MAX;
  LDA (currentLineForPixelInColorRamLoPtr),Y              
  ; Make sure the color we get is addressable by         
  ; presetColorValuesArray.                               
  AND #COLOR_MAX                                         
                                                                                                                                                          
  LDX #$00                                               const indexOfCurrentColor = presetColorValuesArray.indexOf(currentColorForPixel);
b408C
  CMP presetColorValuesArray,X                                                                                                                           
  BEQ b4096                                              
  INX                                                    
  CPX #COLOR_MAX + 1                                     
  BNE b408C                                              
                                                         
b4096
  TXA                                                    let cx = colorIndexForCurrentPixel + 1;
  STA indexOfCurrentColor                                                                                                                                 
  LDX colorIndexForCurrentPixel                          if (cx < indexOfCurrentColor) {
  INX                                                      return;
  CPX indexOfCurrentColor                                }                                                                                                
  BEQ ActuallyPaintPixel                                                                                                                                 
  BPL ActuallyPaintPixel                                 
  RTS                                                    
                                                         
ActuallyPaintPixel                                             
  LDX colorIndexForCurrentPixel                          const newColor = presetColorValuesArray[colorIndexForCurrentPixel];
  LDA presetColorValuesArray,X                           
  STA (currentLineForPixelInColorRamLoPtr),Y             pixel_matrix[x] = newColor;
  RTS                                                    
                                                         const rgba = c.RGBs[newColor];
                                                         const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (pixelXPos * SCALE_FACTOR);
                                                     }
```

Take a look at [the rest of the code](src/psychedelia.js).

