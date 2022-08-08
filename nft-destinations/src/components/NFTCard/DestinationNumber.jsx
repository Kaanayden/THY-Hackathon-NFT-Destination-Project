import React, { useState } from "react";
import SplitFlapDisplay from 'react-split-flap-display';


export default function DestinationNumber(props) {
    console.log("number = " + props.number);
    return (

        <SplitFlapDisplay
            background='#000000'
            borderColor='#883030'
            borderWidth='1px'
            characterSet={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
            characterWidth='2em'
            fontSize='2em'
            minLength={4}
            padDirection='left'
            step={200}
            textColor='#d40707'
            //value='94103'
            value={props.number.toString()}
            withSound={true}
        />
        
    
    );

}