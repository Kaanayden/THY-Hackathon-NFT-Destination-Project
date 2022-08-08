import React, { useState } from "react";
import SplitFlapDisplay, { ALPHA } from 'react-split-flap-display';


export default function FlipFlapAlpha(props) {
    return (

        <SplitFlapDisplay
            background='#000000'
            borderColor='#883030'
            borderWidth='1px'
            characterSet={ALPHA}
            characterWidth='2em'
            fontSize='2em'
            minLength={4}
            padDirection='left'
            step={200}
            textColor='#d40707'
            value={props.text}
            withSound={false}
        />


    );

}