import React, { FunctionComponent, useState, useEffect } from 'react';
import Led from './led/Led';
import './Matrix.scss';
import Frame from '../types/Frame';
import MatrixElement from '../types/MatrixElement';
import useEventListener from '@use-it/event-listener'


let dir = 1;

const MatrixComponent: FunctionComponent = () => {

    const [activeFrame, setActiveFrame] = useState(0);
    const [selectedColor, setSelectedColor] = useState<number>(0xFFFFFF);
    const [playing, setPlaying] = useState(false);
    const [matrixExportada, setMatrixExportada] = useState<string>('');
    const [matrixArduino, setMatrixArduino] = useState<string>('');
    const [frames, setFrames] = useState<Frame>()
    const [spacingH, setSpacingH] = useState<number>(1.92)
    const [spacingV, setSpacingV] = useState<number>(3.5)
    const [ledSize, setLedSize] = useState<number>(5)

    const [width, setWidth] = useState(18);
    const [height, setHeight] = useState(8);

    const changeInput = (setState: Function, value: string) => {
        setState(parseFloat(value))
    }

    let interval: NodeJS.Timeout;

    useEffect(() => {
        updateFrames();
    }, [width, height])

    useEffect(() => {
        if (playing) {
            interval = setTimeout(() => {
                if (activeFrame + dir > 6) {
                    dir = -1
                } else if (activeFrame + dir < 0) {
                    dir = +1
                }

                setActiveFrame(activeFrame + dir);
            }, 100)
        } else {
            clearTimeout(interval);
        }
    }, [playing, activeFrame])

    const updateFrames = () => {
        const f: Frame = [];

        for (let i = 0; i <= 5; i++) {
            f[i] = [];
            for (let r = 0; r < height; r++) {
                f[i][r] = [];
                for (let c = 0; c < width; c++) {
                    f[i][r][c] = {
                        c,
                        r,
                        light: !!f[i][r][c] && !!f[i][r][c].light,
                        color: f[i][r][c] && f[i][r][c].color,
                    }
                }
            }
        }

        setFrames(f);
    }

    const toggleLed = (el: MatrixElement, light: boolean) => {
        if (frames) {
            const frame: Frame = frames;

            frame[activeFrame][el.r][el.c].light = light;
            frame[activeFrame][el.r][el.c].color = selectedColor;

            setFrames(frame);
        }
    }

    const play = () => {
        setPlaying(!playing);
    }

    useEventListener('keydown', (e: any) => {
        if (e.key === 'ArrowUp') {
            if (activeFrame < 6) {
                setActiveFrame(activeFrame + 1)
            }
        } else if (e.key === 'ArrowDown') {
            if (activeFrame > 0) {
                setActiveFrame(activeFrame - 1)
            }
        }
    })

    const createMatrixExportavel = () => {
        const matrix: any = []
        frames?.forEach((f, iF) => {
            matrix.push([])
            f.forEach((r, iR) => {
                matrix[iF].push([])
                r.forEach((c, iC) => {
                    matrix[iF][iR].push([])
                    matrix[iF][iR][iC] = c.light ? 1 : 0
                })
            })
        })

        setMatrixExportada(JSON.stringify(matrix));
    }

    const createMatrixArduino = () => {
        if (!matrixExportada)
            return;

        const matrix = JSON.parse(matrixExportada);

        const matrixArduino: string = matrix.reduce((full, f, index) => {

            return `${full}const bool mount_${index}[] PROGMEM = {\n${
                f.reduce((fullR, fR, indexR) => {
                    return `${fullR}\t${fR.join(',').replace(/1/g,'true').replace(/0/g,'false')},\n`
                }, ''
                ).slice(0, -2)
                }\n};\n\n`
        }, '')

        setMatrixArduino(matrixArduino);
    }

    const loadMatrixExportada = (value: string) => {
        const frames: Frame = [];

        if (value) {

            const matrix: any = JSON.parse(value);

            matrix.forEach((f: any, iF: number) => {
                frames[iF] = [];
                f.forEach((r: any, iR: number) => {
                    frames[iF][iR] = [];
                    r.forEach((c: any, iC: number) => {
                        frames[iF][iR][iC] = {
                            c: iC,
                            r: iR,
                            light: !!parseInt(c, 16),
                            color: parseInt(c, 16),
                        }
                    })
                })
            })

            setFrames(frames);
        }

        setMatrixExportada(value);
    }

    return (
        <div className="container">
            <div className="matrix">
                <div className="medidas">
                    Width: <input type="text" value={width} placeholder="Width" onChange={e => changeInput(setWidth, e.target.value)} />
                    Height: <input type="text" value={height} placeholder="Height" onChange={e => changeInput(setHeight, e.target.value)} />
                    Led Size: <input type="text" value={ledSize} placeholder="Height" onChange={e => changeInput(setLedSize, e.target.value)} />
                    Horizontal Spacing: <input type="text" value={spacingH} placeholder="Horizontal spacing" onChange={e => changeInput(setSpacingH, e.target.value)} />
                    Vertical Spacing: <input type="text" value={spacingV} placeholder="Vertical spacing" onChange={e => changeInput(setSpacingV, e.target.value)} />
                </div>
                <div className="medidas">
                    Color picker: <input type="color" value={`#${selectedColor.toString(16)}`} onChange={e => setSelectedColor(parseInt(e.target.value.replace(/\#/g, '0x'), 16))} />
                </div>

                <div className="width">{(width * (ledSize + spacingH)) - spacingH}mm</div>
                <div className="height">{(height * (ledSize + spacingV) - spacingV)}mm</div>
                {
                    frames && frames[activeFrame].map((r, indexR) =>
                        <div className="row" key={indexR}>
                            {
                                r.map((c, indexC) =>
                                    <div className="column" key={indexC}>
                                        <Led
                                            el={c}
                                            toggle={toggleLed}
                                            playing={playing}
                                            selectedColor={selectedColor}
                                            ledSize={ledSize}
                                            spacingV={spacingV}
                                            spacingH={spacingH}
                                        />
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                <div className="totalLeds">{width * height} leds</div>
                <div className="slider">
                    <input value={activeFrame} onChange={e => setActiveFrame(parseInt(e.target.value))} type="range" min="0" max="6" />
                </div>
                <button onClick={play}>{playing ? 'Stop' : 'Play'}</button>
            </div>
            <div className="boxes">
                <div className="box">
                    <button onClick={createMatrixExportavel}>Gerar Matriz Exportável</button>
                    <textarea onChange={e => loadMatrixExportada(e.target.value)} value={matrixExportada} />
                </div>
                <div className="box">
                    <button onClick={createMatrixArduino}>Gerar Matriz para Arduino</button>
                    <textarea readOnly={true} value={matrixArduino} />
                </div>
            </div>
        </div>
    );
}

export default MatrixComponent;
