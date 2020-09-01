import React, { FunctionComponent, useState, useEffect } from 'react';
import MatrixElement from '../../types/MatrixElement';
import './Led.scss';

type LedProps = {
    el: MatrixElement,
    toggle: Function,
    playing: boolean,
    selectedColor: number,
    spacingH: number,
    spacingV: number,
    ledSize: number,
}

const Led: FunctionComponent<LedProps> = ({ el, toggle, playing, selectedColor, spacingH, spacingV, ledSize }) => {

    const [light, setLight] = useState(el.light);
    const [color, setColor] = useState(selectedColor);

    useEffect(() => {
        setLight(el.light);
        setColor(el.color);
    }, [el])

    const toggleLed = () => {
        setLight(!light);
        setColor(selectedColor);
        toggle(el, !light);
    }

    return (
        <div className="led" style={
            {
                // backgroundColor: light ? `#${color.toString(16)}` : '',
                backgroundColor: light ? `#FFF` : '',
                // boxShadow: light ? `0 0 15px 4px #${color.toString(16)}B4` : '',
                boxShadow: light ? `0 0 15px 4px #FFFFFFB4` : '',
                width: `${ledSize}mm`,
                height: `${ledSize}mm`,
                margin: `${spacingV}mm ${spacingH}mm 0 0`,
            }
        } onClick={toggleLed} >

        </div >
    )
}

export default Led;